# Smart Contracts Hub

## Setup
Set master.key as required

### Development
In separate terminal windows:
```
foreman start --procfile Procfile.dev
```

## Checking code
```
bundle exec rspec
bundle exec rubocop -A
bundle exec haml-lint app/views/
yarn prettier --write app/javascript/
bundle exec scss-lint app/assets/stylesheets/
```