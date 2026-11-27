// /join#k=<family key>: keep the key on this device, then open the dashboard.
import { setKey, takeFragment } from "./api.js";

const k = takeFragment("k");
if (k && setKey(k)) {
  location.replace("/");
} else {
  document.getElementById("out").textContent = k
    ? "This browser won't save the link (private mode?). Open it in a normal window."
    : "This invite link is missing its key. Ask your family to copy it again.";
}
