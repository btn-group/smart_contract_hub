# frozen_string_literal: true

# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'

require File.expand_path('../config/environment', __dir__)
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?

require 'rspec/rails'

# Add additional requires below this line. Rails is not loaded until this point!
require 'active_storage_validations/matchers'
require 'database_cleaner/active_record'
require 'shoulda/matchers'

Dir[Rails.root.join('spec/models/concerns/*.rb')].each { |f| require f }

# === RSPEC ===
RSpec.configure do |config|
  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
  # arbitrary gems may also be filtered via:
  # config.filter_gems_from_backtrace("gem name")

  # === ACTIVE STORAGE VALIDATIONS ===
  config.include ActiveStorageValidations::Matchers

  # === Database cleaner ===
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end
  config.around do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end

  #=== FACTORYBOT ===
  config.include FactoryBot::Syntax::Methods
end

# === SHOULDA MATCHERS ===
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
