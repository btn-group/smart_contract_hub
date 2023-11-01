# Smart Contract Hub

## Setup
Set master.key as required

### Development

```
bin/dev
```

## Checking code
```
rspec
rubocop -A
haml-lint app/views/
yarn prettier --write app/javascript/
scss-lint app/assets/stylesheets/
```

## Velzon template 

## Storage decisions

- Files are being stored and served from Storj.
- A backup is being stored on Solar Communications, this may have to be manually done as mirroring with direct uploads may not work.
- Active Storage is being used to assist with direct uploads and validations, but the url is generated in the frontend which points to a public Storj bucket link. For this to work, the ActiveStorage::DirectUploadsController is monkey patched to store the key with the file extension. These decisions were made as links made by ActiveStorage have expiry dates.
- The smart contract new form is used to create the record on the Smart Contact Hub smart contract. This means that all blobs will be orphans. Double check before deleting them as deletion from the bucket will be a disaster.

## References

1. https://docs.storj.io/dcs/code/rails-activestorage
2. https://edgeguides.rubyonrails.org/active_storage_overview.html
3. https://docs.azero.id/
4. https://github.com/rails/rails/blob/main/activestorage/app/models/active_storage/blob.rb#L113
5. https://web-crunch.com/posts/rails-drag-drop-active-storage-stimulus-dropzone
6. https://docs.dropzone.dev/configuration/events
