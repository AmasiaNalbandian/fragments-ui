// src/app.js

import { deleteFragment, getUserFragments, getFragmentDataByExt, putFragment } from "./api";
import { Auth, getUser } from "./auth";
import { newFileUploaded } from "./createNewFragment"

var user;
var userSection = document.querySelector("#user");
var viewFragmentsSection = document.querySelector("#viewFragments");
var editFragmentSection = document.querySelector("#editFragment");

async function init() {
  // Get our UI elements

  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const getFragmentBtn = document.querySelector("#getFragmentBtn");

  // Retrieve all fragments
  getFragmentBtn.onclick = () => {
    populateTable();
  };

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  user = await getUser();

  // Do an authenticated request to the fragments API server and log the result
  // getUserFragments(user);
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  } else {
    // if we are signed in, trigger a get request
    populateTable();
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;
  viewFragmentsSection.hidden = false;
  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;


   // Add "change" event to the input selector.
  // This will automatically upload any fragment that is selected.
  fileInput.onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
      files = tgt.files;
    var extension = this.files[0].name.split(".").pop().toLowerCase();

    newFileUploaded(user, files, extension, editFragmentSection.querySelector(".editFragmentId").innerText);
  };
}
function getValidConversions(type) {
  let conversions = [];
  switch (type) {
    case "text/plain":
      conversions = [".txt"];
      break;
    case "text/markdown":
      conversions = [".md", ".html", ".txt"];
      break;
    case "text/html":
      conversions = [".html", ".txt"];
      break;
    case "application/json":
      conversions = [".json", ".txt"];
      break;
    case "image/png":
      conversions = [".png", ".jpg", ".webp", ".gif"];
      break;
    default:
      conversions = [];
  }

  return conversions;
}

function populateTable() {

  
  let fragmentHtml = "";
  let fragmentList = document.querySelector(".fragmentList");
  fragmentList.innerHTML = "";
  getUserFragments(user).then((data) => {
    if (data.length) {
      // Create the titles for each column and add to the table
      let header = document.createElement("tr");
      let headerOptions = [
        "ID",
        "Created",
        "Updated",
        "Type",
        "View",
        "Actions",
      ];
      for (let column of headerOptions) {
        let th = document.createElement("th");
        th.append(column);
        header.appendChild(th);
      }
      fragmentList.appendChild(header);

      for (let fragment of data) {
        let tr = document.createElement("tr");
        let id = document.createElement("td");
        let created = document.createElement("td");
        let updated = document.createElement("td");
        let view = document.createElement("td");
        let actions = document.createElement("td");

        let type = document.createElement("td");

        // Get valid conversion array
        let validConversionOptions = getValidConversions(fragment.type);

        // Update Fragment
        let updateButton = document.createElement("button");
        updateButton.innerHTML = "Update";
        updateButton.id = `${fragment.id}`;
        updateButton.addEventListener("click", () => {
          showEdit(fragment.id, validConversionOptions[0])
        });

        // Delete button
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        deleteButton.id = `${fragment.id}`;
        deleteButton.addEventListener("click", () => {
          console.log("clicked button with id ", fragment.id);
          deleteFragment(user, fragment.id);
        });

        // CONVERSION LINKS
        for (let conversionType of validConversionOptions) {
          let a = document.createElement("a");
          a.href = `#`;
          a.addEventListener("click", () => {
            showPreview(fragment.id, conversionType);
          });
          a.innerHTML = conversionType;
          a.style = "margin-right: 10px";
          view.append(a);
        }

        id.append(fragment.id);
        created.append(fragment.created);
        updated.append(fragment.updated);
        type.append(fragment.type);
        actions.append(deleteButton, updateButton);
        tr.append(id, created, updated, type, view, actions);

        fragmentList.appendChild(tr);
      }
    } else {
      let td = document.createElement("td");
      td.append("No fragments were found");

      fragmentList.append(td);
    }
  });
  fragmentList.html = fragmentHtml;
}

function showPreview(fragmentId, type) {
  const outImage = document.querySelector("#preview-img");
  const fragmentPreview = document.getElementById("output");
  
  // Clear out anything previous
  outImage.src = "";
  fragmentPreview.textContent = "";
  // let data = getFragmentDataByExt(user, fragmentId, type);
  getFragmentDataByExt(user, fragmentId, type).then((data) => {
    type === ".png"
      ? (outImage.src = data)
      : (fragmentPreview.textContent = data);
  });
}

function showEdit(fragmentId, ext) {
  console.log("clicked button with id to update ", fragmentId);
  viewFragmentsSection.hidden = true;
  editFragmentSection.hidden = false;
  editFragmentSection.querySelector(".editFragmentId").innerText = fragmentId;
  
  
  showPreview(fragmentId, ext)
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
