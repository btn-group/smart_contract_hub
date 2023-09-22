import "@hotwired/turbo-rails";
import "./src/jquery";
import "bootstrap";
import "./src/lodash";
import "./src/toastr";

// === ACTIVE STORAGE ===
import * as ActiveStorage from "@rails/activestorage";
ActiveStorage.start();

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
