import DataTable from "datatables.net-bs5";

const SMART_CONTRACTS_INDEX = {
  datatable: undefined,
  init: async () => {
    SMART_CONTRACTS_INDEX.addListeners();
    SMART_CONTRACTS_INDEX.datatable = new DataTable("#smart-contracts-table", {
      columns: [
        {
          data: "id",
          title: "#",
        },
        {
          data: "address",
          title: "Smart Contract",
        },
        {
          data: "caller",
          title: "Caller",
        },
        {
          data: "azeroId",
          title: "AZERO.ID",
        },
        {
          data: "group.name",
          title: "Group",
        },
      ],
      ordering: false,
      paging: false,
      bInfo: false,
      searching: false,
    });
  },
  addListeners: () => {
    $("#search-input").on("input", async (_evt) => {
      let search = $("#search-input").val();
      let smartContracts = await $.ajax({
        type: "post",
        url: "http://localhost:4350/graphql",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
          query: `query MyQuery {
            smartContracts(where: {address_containsInsensitive: "${search}", OR: {group: {name_containsInsensitive: "${search}"}, OR: {caller_containsInsensitive: "${search}", OR: {azeroId_containsInsensitive: "${search}"}}}}) {
              abiUrl
              address
              auditUrl
              azeroId
              caller
              chain
              contractUrl
              enabled
              github
              id
              projectName
              wasmUrl
              projectWebsite
              group {
                name
              }
            }
          }`,
        }),
      });
      smartContracts = smartContracts.data.smartContracts;
      SMART_CONTRACTS_INDEX.datatable.clear();
      SMART_CONTRACTS_INDEX.datatable.rows.add(smartContracts);
      SMART_CONTRACTS_INDEX.datatable.columns.adjust().draw();
      console.log(smartContracts);
    });
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-index").length) {
    SMART_CONTRACTS_INDEX.init();
  }
});
