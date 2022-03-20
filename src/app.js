// src/app.js

import { getUserFragments, postFragment } from "./api";
import { Auth, getUser } from "./auth";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const textFragmentBtn = document.querySelector("#textFragmentBtn");
  const textFragmentInput = document.querySelector("#textFragmentInput");
  const getFragmentBtn = document.querySelector("#getFragmentBtn");
  const fragmentType = document.querySelector("#fragmentType");
  const msg = document.querySelector("#postFeedback");
  //Submit button
  textFragmentBtn.onclick = () => {
    if (postFragment(user, textFragmentInput.value, fragmentType.value)) {
      getFragmentBtn.click()
      msg.innerHTML = "<b class='successMsg'>Successfully created fragment!</b>"
      textFragmentInput.value = '';
    } else {
      msg.innerHTML = "Error creating fragment!"
    }
  };

  // Retrieve all fragments
  getFragmentBtn.onclick = () => {
    let fragmentHtml = "";
    let fragmentList = document.querySelector(".fragmentList");
    fragmentList.innerHTML = "";
    let allFragments = getUserFragments(user).then((data) => {
      if (data.length) {
        // Create the titles for each column and add to the table
        let header = document.createElement("tr");
        let headerOptions = ['id', 'created', 'updated', 'type'];
        for (let column of headerOptions) {
          let th = document.createElement("th");
          th.append(column);
          header.appendChild(th)
        }
        fragmentList.appendChild(header);

        for (let fragment of data) {
          console.log("fragment", fragment);
          let tr = document.createElement("tr");
          let id = document.createElement("td");
          let created = document.createElement("td");
          let updated = document.createElement("td");
          let type = document.createElement("td");

          id.append(fragment.id);
          created.append(fragment.created);
          updated.append(fragment.updated);
          type.append(fragment.type);
          tr.append(id, created, updated, type);

          fragmentList.appendChild(tr);
        }
      } else {
        let td = document.createElement("td");
        td.append("No fragments were found");

        fragmentList.append(td);
      }
    });
    fragmentList.html = fragmentHtml;
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
  } else {
    // if we are signed in, trigger a get request
    getFragmentBtn.click()

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

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
