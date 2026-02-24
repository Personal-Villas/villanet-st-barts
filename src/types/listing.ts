export interface Listing {
  id: string
  listing_id?: string
  name: string
  heroImage?: string | null
  images_json?: string[]
  priceUSD?: number | null
  price_usd?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  location_text?: string | null
  location?: string | null
  villanet_rank?: number | null
  rank?: number | null
  villanet_destination_tag?: string | null
  villaNetDestinationTag?: string | null
  max_guests?: number | null
  guesty_booking_domain?: string | null
  villanetChefIncluded?: boolean
  villanetHeatedPool?: boolean
  villanetOceanView?: boolean
  villanetTrueBeachFront?: boolean
  villanetOceanFront?: boolean
  villanetWalkToBeach?: boolean
  villaNetPropertyManagerName?: string | null
}