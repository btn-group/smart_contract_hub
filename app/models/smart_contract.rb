# frozen_string_literal: true

class SmartContract < ApplicationRecord
  attr_accessor :smart_contract_address, :environment, :azero_id, :group_id, :abi_url, :contract_url, :wasm_url

  # === ACTIVE STORAGE ===
  has_one_attached :abi
  has_one_attached :contract
  has_one_attached :wasm

  # === VALIDATIONS ===
  validates :third_party_identifier, uniqueness: { case_sensitive: false }
  # ACTIVE STORAGE
  validates :abi, attached: true, content_type: :json, size: { less_than: 500.kilobyte }
  # octet_stream is the content_type of a .contract file
  validates :contract, content_type: :octet_stream, size: { less_than: 500.kilobyte }
  validates :wasm, content_type: :wasm, size: { less_than: 500.kilobyte }
end
