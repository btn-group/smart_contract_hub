# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SmartContract do
  describe 'VALIDATIONS' do
    before { create(:smart_contract) }

    it { should validate_uniqueness_of(:third_party_identifier).case_insensitive }

    describe 'active storage' do
      it { should validate_attached_of(:abi) }
      it { should validate_content_type_of(:abi).allowing('application/json') }
      it { should validate_size_of(:abi).less_than(500.kilobytes) }
      it { should validate_content_type_of(:contract).allowing('application/octet-stream') }
      it { should validate_size_of(:contract).less_than(500.kilobytes) }
      it { should validate_content_type_of(:wasm).allowing('application/wasm') }
      it { should validate_size_of(:wasm).less_than(500.kilobytes) }
    end
  end
end
