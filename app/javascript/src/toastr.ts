import toastr from "toastr";

declare global {
  interface Document {
    showAlertInfo(text: string, autoHide?: boolean): void;
    showAlertWarning(error: string, autoHide?: boolean): void;
    showAlertDanger(error: string, autoHide?: boolean): void;
    showAlertSuccess(text: string, autoHide?: boolean): void;
  }
}

document.showAlertInfo = function (
  text: string,
  autoHide: boolean = true
): void {
  toastr.options.closeButton = true;
  toastr.options.closeDuration = 0;
  toastr.options.extendedTimeOut = 0;
  toastr.options.preventDuplicates = true;
  toastr.options.tapToDismiss = false;
  toastr.options.timeOut = 0;
  if (autoHide) {
    toastr.options = {
      progressBar: true,
      preventDuplicates: false,
      showDuration: 300,
      hideDuration: 1000,
      timeOut: 5000,
      extendedTimeOut: 1000,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  toastr.info(text);
};

document.showAlertWarning = function (
  error: string,
  autoHide: boolean = true
): void {
  toastr.options.closeButton = true;
  toastr.options.closeDuration = 0;
  toastr.options.extendedTimeOut = 0;
  toastr.options.preventDuplicates = true;
  toastr.options.tapToDismiss = false;
  toastr.options.timeOut = 0;
  if (autoHide) {
    toastr.options = {
      progressBar: true,
      preventDuplicates: false,
      showDuration: 300,
      hideDuration: 1000,
      timeOut: 5000,
      extendedTimeOut: 1000,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  toastr.warning(error);
};

document.showAlertDanger = function (
  error: any,
  autoHide: boolean = false
): void {
  if (error != "Error: Request rejected") {
    if (error.msg) {
      error = error.msg;
    } else if (error.message) {
      error = error.message;
    } else if (error.responseJSON && error.responseJSON.error) {
      error = error.responseJSON.error;
    } else if (error.statusText && error.statusText != "error") {
      error = error.responseText;
    } else if (error.errorMessage) {
      error = error.errorMessage;
      if (error.toLowerCase() == "usercancelled") {
        return;
      }
    }
    if (
      error == "Response closed without headers" ||
      (error.statusText && error.statusText == "error") ||
      error == ""
    ) {
      autoHide = true;
      error =
        "Unknown error... Please check your internet connection or contact btn.group through Discord or Telegram.";
    } else if (
      error.includes("Enclave: failed to verify transaction signature")
    ) {
      error =
        "Keplr issue. Please restart your browser. Do not refresh, restart.";
    }
    toastr.options.closeButton = true;
    toastr.options.closeDuration = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.preventDuplicates = true;
    toastr.options.tapToDismiss = false;
    toastr.options.timeOut = 0;
    if (autoHide) {
      toastr.options = {
        progressBar: true,
        preventDuplicates: false,
        showDuration: 300,
        hideDuration: 1000,
        timeOut: 5000,
        extendedTimeOut: 1000,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      };
    }
    toastr.error(error);
  }
};

document.showAlertSuccess = function (
  text: string,
  autoHide: boolean = false
): void {
  toastr.options.closeButton = true;
  toastr.options.closeDuration = 0;
  toastr.options.extendedTimeOut = 0;
  toastr.options.preventDuplicates = true;
  toastr.options.tapToDismiss = false;
  toastr.options.timeOut = 0;
  if (autoHide) {
    toastr.options = {
      progressBar: true,
      preventDuplicates: false,
      showDuration: 300,
      hideDuration: 1000,
      timeOut: 5000,
      extendedTimeOut: 1000,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  }
  toastr.success(text);
};
