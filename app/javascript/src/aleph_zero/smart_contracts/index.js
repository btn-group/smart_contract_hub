import DataTable from "datatables.net-bs5";

const SMART_CONTRACTS_INDEX = {
  datatable: undefined,
  queryCount: 0,
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
      processing: true,
      bInfo: false,
      searching: false,
    });
  },
  addListeners: () => {
    $("#search-input").on("input", async (_evt) => {
      console.log(555);
      // 1. Set to loading and clear table
      SMART_CONTRACTS_INDEX.datatable.clear();
      SMART_CONTRACTS_INDEX.datatable.processing(true);

      // 2. Increase query count
      SMART_CONTRACTS_INDEX.queryCount += 1;
      let currentQueryCount = ALEPH_ZERO.SMART_CONTRACTS_INDEX;

      // 3. Search
      let search = $("#search-input").val();
      let smartContracts = [];
      try {
        if (search.length) {
          console.log(333);
          console.log(document.delay);
          await document.delay(5_000);
          let response = await $.ajax({
            type: "post",
            url: "https://squid.subsquid.io/smart-contract-hub/graphql",
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
          smartContracts = response.data.smartContracts;
        }
      } finally {
        if (currentQueryCount == SMART_CONTRACTS_INDEX.queryCount) {
          SMART_CONTRACTS_INDEX.datatable.rows.add(smartContracts);
          SMART_CONTRACTS_INDEX.datatable.columns.adjust().draw();
          SMART_CONTRACTS_INDEX.datatable.processing(false);
        }
      }
    });
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-index").length) {
    console.log(554)
    SMART_CONTRACTS_INDEX.init();
  }
});
