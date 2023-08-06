import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

$(document).ready(function () {
  if ($("#metadata-new").length) {
    const METADATA_NEW = {
      init: async () => {
        METADATA_NEW.addListeners();
        await ALEPH_ZERO.activatePolkadotJsExtension();
      },
      addListeners: () => {
        // === CLOUDINARY ===
        var myWidget = cloudinary.createUploadWidget(
          {
            cloudName: "hv5cxagki",
            uploadPreset: "smart_contract_metadata",
            multiple: false,
            maxImageFileSize: 50_000,
            resourceType: "raw",
          },
          (error, result) => {
            if (!error && result && result.event === "success") {
              document.newForm.url.value = result.info.secure_url;
            }
          }
        );

        document.getElementById("cloudinary-upload-widget").addEventListener(
          "click",
          function (evt) {
            myWidget.open();
            evt.preventDefault();
          },
          false
        );

        // === FORMS ===
        document.newForm.onsubmit = async (e) => {
          e.preventDefault();
          let buttonSelector = "[name='newForm'] button[type='submit']";
          document.disableButton(buttonSelector);
          try {
            let smartContractAddress =
              document.newForm.smartContractAddress.value;
            let url = document.newForm.url.value;
            let api = await ALEPH_ZERO.api();
            let account = ALEPH_ZERO.account;
            api.setSigner(ALEPH_ZERO.getSigner());
            const contract = await ALEPH_ZERO.contracts[
              "azSmartContractMetadataHub"
            ].getContract();
            window.contract = contract;
            await POLKADOTJS.contractTx(
              api,
              account.address,
              contract,
              "create",
              {},
              [smartContractAddress, url, 0]
            );
            document.newForm.smartContractAddress.value = "";
            document.newForm.url.value = "";
            document.showAlertSuccess("Success", true);
          } catch (err) {
            document.showAlertDanger(err);
          } finally {
            document.enableButton(buttonSelector);
          }
        };
      },
    };

    METADATA_NEW.init();
  }
});
