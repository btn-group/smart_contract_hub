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

## References

1. https://docs.storj.io/dcs/code/rails-activestorage
2. https://edgeguides.rubyonrails.org/active_storage_overview.html
3. https://docs.azero.id/
4. https://github.com/rails/rails/blob/main/activestorage/app/models/active_storage/blob.rb#L113
5. https://web-crunch.com/posts/rails-drag-drop-active-storage-stimulus-dropzone
