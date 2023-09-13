import jquery from "jquery";
declare global {
  interface Window {
    jQuery: typeof jquery;
    $: typeof jquery;
  }
}
window.jQuery = jquery;
window.$ = jquery;
