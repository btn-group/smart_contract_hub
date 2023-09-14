import "@hotwired/turbo-rails";
import "./src/jquery";
import { createPopper } from "@popperjs/core";
import "bootstrap";
import ClipboardJS from "clipboard";
import "./src/lodash";
import "./src/toastr";

// === CUSTOM ===
import "./src/polkadotjs";
import "./src/aleph_zero/helpers";
import "./src/aleph_zero/groups/edit";
import "./src/aleph_zero/smart_contracts/new";

export const HELPERS = {
  cookies: {
    get: (id) => {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${id}=`))
        ?.split("=")[1];
    },
  },
  copyToClipboard: (selectorId) => {
    // // Select elements
    // const target = document.getElementById(selectorId);
    // const button = target.nextElementSibling;
    // // Init clipboard -- for more info, please read the offical documentation: https://clipboardjs.com/
    // let clipboard = new ClipboardJS(button, {
    //   target,
    //   text: function () {
    //     return target.innerHTML;
    //   },
    // });
    // // Success action handler
    // clipboard.on("success", function (e) {
    //   var checkIcon = button.querySelector(".bi-check");
    //   var copyIcon = button.querySelector(".bi-clipboard");
    //   // Exit check icon when already showing
    //   if (checkIcon) {
    //     return;
    //   }
    //   // Create check icon
    //   checkIcon = document.createElement("i");
    //   checkIcon.classList.add("bi");
    //   checkIcon.classList.add("bi-check");
    //   checkIcon.classList.add("fs-2x");
    //   // Append check icon
    //   button.appendChild(checkIcon);
    //   // Highlight target
    //   const classes = ["text-success", "fw-boldest"];
    //   target.classList.add(...classes);
    //   // Highlight button
    //   button.classList.add("btn-success");
    //   // Hide copy icon
    //   copyIcon.classList.add("d-none");
    //   // Revert button label after 3 seconds
    //   setTimeout(function () {
    //     // Remove check icon
    //     copyIcon.classList.remove("d-none");
    //     // Revert icon
    //     button.removeChild(checkIcon);
    //     // Remove target highlight
    //     target.classList.remove(...classes);
    //     // Remove button highlight
    //     button.classList.remove("btn-success");
    //   }, 3000);
    // });
  },
  walletCloudinaryPublicId: function (id) {
    switch (id) {
      case "keplr":
        return "logos/b8thbiihwftyjolgjjz2_dhy5mr";
      case "polkadot-js":
        return "logos/download_qbpd9p";
      case "subwallet-js":
        return "logos/subwallet.3be275bc71284f30e5bc_cwag5o";
      case "talisman":
        return "logos/Talisman-Icon-Red_e75eas.png";
      default:
        return "external-content.duckduckgo-1_memqe7";
    }
  },
  setUserAccountMenuToggle: (parentSelector, address, name, source) => {
    $(`${parentSelector} img.user-address-alias-avatar`).attr(
      "src",
      `https://res.cloudinary.com/hv5cxagki/image/upload/c_scale,dpr_2,f_auto,h_25,q_100/${HELPERS.walletCloudinaryPublicId(
        source
      )}`
    );
    $(`${parentSelector} .account-name`).text(name);
    $(`${parentSelector} .account-address-abbreviated`).text(
      `${address.substring(0, 3)}...${address.slice(-3)}`
    );
  },
};

document.disableButton = function (selector) {
  let $button = $(selector);
  $button.prop("disabled", true);
  $button.find(".loading").removeClass("d-none");
  $button.find(".ready").addClass("d-none");
};

document.enableButton = function (selector) {
  let $button = $(selector);
  $button.prop("disabled", false);
  $button.find(".loading").addClass("d-none");
  $button.find(".ready").removeClass("d-none");
};
