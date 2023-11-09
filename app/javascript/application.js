import "@hotwired/turbo-rails";
import "./src/jquery";
import "@popperjs/core";
import "bootstrap";
import "./src/lodash";
import "./src/toastr";
import { DirectUpload } from "@rails/activestorage";
import Dropzone from "dropzone";

// === ACTIVE STORAGE ===
import * as ActiveStorage from "@rails/activestorage";
ActiveStorage.start();

// === VELZON ===
import "../../lib/assets/js/layout";
import "../../lib/assets/js/app";

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
        url: directUploadUrl,
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
          let $button = $(selector)
            .closest("form")
            .find("button[type='submit']");
          $button.find(".loading-status").text("Uploading file...");
          document.disableButton($button);
          $(selector).attr("data-uploading-file", true);

          // disable form submit button and set text of button to uploading file
          // Set data attribute of input selector to uploading file
          // Afterwards, enable button, change text back to loading if no more uploading
          const upload = new DirectUpload(file, directUploadUrl);
          upload.create((error, blob) => {
            $(selector).attr("data-uploading-file", false);
            if (
              $(selector).closest("form").find('[data-uploading-file="true"]')
                .length == 0
            ) {
              document.enableButton($button);
              $button.find(".loading-status").text("Loading...");
            }
            if (error) {
              document.showAlertDanger(error);
              dropZone.removeFile(file);
              return;
            } else if (
              dropZone.getAcceptedFiles()[0] &&
              dropZone.getAcceptedFiles()[0].upload.uuid == file.upload.uuid
            ) {
              $(inputSelector).val(HELPERS.storj.downloadUrl(blob.key));
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
  storj: {
    downloadUrl: (fileName) => {
      let storjPrefix;
      if ($("body.rails-env-development").length) {
        storjPrefix = `jxilw2olwgoskdx2k4fvsswcfwfa/smart-contract-hub-development`;
      } else {
        storjPrefix = `juldos5d7qtuwqx2itvdhgtgp3vq/smart-contract-hub-production`;
      }
      return `https://link.storjshare.io/s/${storjPrefix}/${fileName}?download=1`;
    },
  },
  toastr: {},
  copyToClipboard: (selectorId) => {
    // Select elements
    const target = document.getElementById(selectorId);
    const button = target.nextElementSibling;

    // Init clipboard -- for more info, please read the offical documentation: https://clipboardjs.com/
    let clipboard = new ClipboardJS(button, {
      target,
      text: function () {
        return target.innerHTML;
      },
    });

    // Success action handler
    clipboard.on("success", function () {
      var checkIcon = button.querySelector(".bi-check");
      var copyIcon = button.querySelector(".bi-clipboard");

      // Exit check icon when already showing
      if (checkIcon) {
        return;
      }

      // Create check icon
      checkIcon = document.createElement("i");
      checkIcon.classList.add("bi");
      checkIcon.classList.add("bi-check");
      checkIcon.classList.add("fs-4");

      // Append check icon
      button.appendChild(checkIcon);

      // Highlight target
      const classes = ["text-success", "fw-boldest"];
      target.classList.add(...classes);

      // Highlight button
      button.classList.add("btn-success");

      // Hide copy icon
      copyIcon.classList.add("d-none");

      // Revert button label after 3 seconds
      setTimeout(function () {
        // Remove check icon
        copyIcon.classList.remove("d-none");

        // Revert icon
        button.removeChild(checkIcon);

        // Remove target highlight
        target.classList.remove(...classes);

        // Remove button highlight
        button.classList.remove("btn-success");
      }, 3000);
    });
  },
  // $ needs time to load tooltip
  initPopovers: async () => {
    while (!$().tooltip) {
      await document.delay(500);
    }
    $('[data-bs-toggle="popover"]').popover({});
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
