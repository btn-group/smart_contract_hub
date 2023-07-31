$(document).ready(function () {
  if ($("#metadata-new").length) {
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
          console.log("Done! Here is the image info: ", result.info);
          let imageUrl = result.info.secure_url;
          console.log(imageUrl);
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
  }
});
