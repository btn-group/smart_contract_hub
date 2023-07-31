# frozen_string_literal: true

Rails.application.routes.draw do
  resources :metadata, only: :new

  root 'metadata#index'
end
