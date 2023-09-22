# frozen_string_literal: true

# Creates a new blob on the server side in anticipation of a direct-to-service upload from the client side.
# When the client-side upload is completed, the signed_blob_id can be submitted as part of the form to reference
# the blob that was created up front.

# 22/SEP/2023 - Monkey patching this so that file extensions are used for keys
# May not even need to use active storage
module ActiveStorage
  class DirectUploadsController < ActiveStorage::BaseController
    def create
      blob = ActiveStorage::Blob.create_before_direct_upload!(**blob_args.merge(key: "#{ActiveStorage::Blob.generate_unique_secure_token(length: ActiveStorage::Blob::MINIMUM_TOKEN_LENGTH)}.#{blob_args[:filename].split('.').last}"))
      render json: direct_upload_json(blob)
    end

    private

      def blob_args
        params.require(:blob).permit(:filename, :byte_size, :checksum, :content_type, metadata: {}).to_h.symbolize_keys
      end

      def direct_upload_json(blob)
        blob.as_json(root: false, methods: :signed_id).merge(direct_upload: {
                                                               url: blob.service_url_for_direct_upload,
                                                               headers: blob.service_headers_for_direct_upload
                                                             })
      end
  end
end
