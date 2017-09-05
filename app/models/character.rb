class Character < ApplicationRecord
  belongs_to :game
  validates_presence_of :name
end
