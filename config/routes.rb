Rails.application.routes.draw do
  root "games#index"
  get "games_form", to: "games#form"
  get "characters_form", to: "characters#form"

  resources :games do
    resources :characters
  end
  
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
