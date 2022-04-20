// src/createNewFragment.js

import { postFragment } from "./api";
import { Auth, getUser } from "./auth";

async function init() {
  // Get our UI elements
  const editFragment = localStorage.getItem('editFragment');
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const textFragmentInput = document.querySelector("#textFragmentInput");
  const getFragmentBtn = document.querySelector("#getFragmentBtn");
  const msg = document.querySelector("#postFeedback");
  const fileInput = document.querySelector("#fileInput");
  const outImage = document.querySelector("#preview-img");
  const fragmentPreview = document.getElementById("output");

  // Add "change" event to the input selector.
  // This will automatically upload any fragment that is selected.
  fileInput.onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
      files = tgt.files;
    var extension = this.files[0].name.split(".").pop().toLowerCase();

    // Clear out existing data
    fragmentPreview.textContent = "";
    outImage.src = "";

    // FileReader support
    if (FileReader && files && files.length) {
      var fr = new FileReader();
      fr.onload = function () {
        extension === "png"
          ? (outImage.src = fr.result)
          : (fragmentPreview.textContent = fr.result);

        if (postFragment(user, fr.result, getMimeType(extension))) {
          getFragmentBtn.click();
          msg.innerHTML =
            "<b class='successMsg'>Successfully created fragment!</b>";
          textFragmentInput.value = "";
        } else {
          msg.innerHTML = "Error creating fragment!";
        }
      };
      extension === "png"
        ? fr.readAsDataURL(files[0])
        : fr.readAsText(this.files[0]);
    }
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
  const user = await getUser();

  // Do an authenticated request to the fragments API server and log the result
  // getUserFragments(user);
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  } 

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}


function getMimeType(extension) {
  let mimeType = "";
  switch (extension) {
    case "txt":
      mimeType = "text/plain";
      break;
    case "md":
      mimeType = "text/markdown";
      break;
    case "html":
      mimeType = "text/html";
      break;
    case "json":
      mimeType = "application/json";
      break;
    case "png":
      mimeType = "image/png";
      break;
    default:
      mimeType = "";
  }
  return mimeType;
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
