import "@hotwired/turbo-rails";
import "./src/jquery";
import "bootstrap";
import "./src/lodash";
import "./src/toastr";
import { DirectUpload } from "@rails/activestorage";
import Dropzone from "dropzone";

// === ACTIVE STORAGE ===
import * as ActiveStorage from "@rails/activestorage";
ActiveStorage.start();

// === CUSTOM ===
import "./src/polkadotjs";
import "./src/aleph_zero/helpers";
import "./src/aleph_zero/smart_contracts/index";
import "./src/aleph_zero/smart_contracts/new";
import "./src/aleph_zero/smart_contracts/edit";

export const HELPERS = {
  cookies: {
    get: (id) => {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${id}=`))
        ?.split("=")[1];
    },
  },
  dropzone: {
    create: (
      selector,
      acceptedFiles,
      inputSelector,
      maxFileSize,
      csrfToken,
      directUploadUrl
    ) => {
      let headers = {
        "X-CSRF-Token": csrfToken,
      };
      let dropZone = new Dropzone(selector, {
        url,
        headers,
        maxFiles: 1,
        maxFileSize,
        acceptedFiles,
        addRemoveLinks: true,
        autoQueue: false,
        dictDefaultMessage: "Drop file here to upload",
        init: function () {
          let myDropzone = this;
          let existingFileUrl = $(inputSelector).val();
          if (existingFileUrl.length) {
            let fileDetails = {
              id: inputSelector,
              name: undefined,
              size: 12345,
              imageUrl: undefined,
              accepted: true,
            };
            if (
              existingFileUrl.split("/smart-contract-hub-development/")[1]
                .length
            ) {
              fileDetails.name = existingFileUrl.split(
                "/smart-contract-hub-development/"
              )[1];
            } else if (
              existingFileUrl.split("/smart-contract-hub-production/")[1].length
            ) {
              fileDetails.name = existingFileUrl.split(
                "/smart-contract-hub-production/"
              )[1];
            }
            myDropzone.files.push(fileDetails);
            myDropzone.options.addedfile.call(myDropzone, fileDetails);
            myDropzone.options.complete.call(myDropzone, fileDetails);
            myDropzone.options.success.call(myDropzone, fileDetails);
          }
        },
      });
      // a. Doesn't get called on showing file on server
      // b. This gets called even when maxfilesexceeded
      // manually check the number of accepted files before uploading
      dropZone.on("addedfile", function (file) {
        if (dropZone.getAcceptedFiles().length == 0) {
          const upload = new DirectUpload(file, directUploadUrl);
          upload.create((error, blob) => {
            if (error) {
              document.showAlertDanger(error);
              dropZone.removeFile(file);
              return;
            } else {
              let url;
              if ($("body.rails-env-development").length) {
                url = `https://link.storjshare.io/jxilw2olwgoskdx2k4fvsswcfwfa/smart-contract-hub-development/${blob.key}`;
              } else {
                url = `https://link.storjshare.io/juldos5d7qtuwqx2itvdhgtgp3vq/smart-contract-hub-production/${blob.key}`;
              }
              $(inputSelector).val(url);
            }
          });
        }
      });
      // This if you don't want the exceeded file shown at all
      dropZone.on("maxfilesexceeded", function (file) {
        dropZone.removeFile(file);
      });
      dropZone.on("removedfile", function () {
        $(inputSelector).val(undefined);
      });
    },
  },
  toastr: {},
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

document.delay = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });
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
