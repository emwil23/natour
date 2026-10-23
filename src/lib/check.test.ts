import { describe, expect, it } from 'vitest'
import { matchPlace, nameScore, words, type ApiPlace } from './check'

const place = (name: string, type = 'attraction', category = 'tourism'): ApiPlace => ({
  name,
  address: `${name}, Lisboa, Portugal`,
  lat: 38.7,
  lon: -9.1,
  category,
  type,
  osm: 'node/1',
  bbox: [38.6, 38.8, -9.2, -9.0],
})

describe('words', () => {
  it('drops accents, punctuation and filler words', () => {
    expect(words('Miradouro da Senhora do Monte')).toEqual(['miradouro', 'senhora', 'monte'])
    expect(words("Café A Brasileira — Chiado's")).toEqual(['cafe', 'brasileira', 'chiado', 's'])
    expect(words('Torre de Belém')).toEqual(['torre', 'belem'])
  })
})

describe('nameScore', () => {
  it("is the share of the suggestion's words in the OSM name", () => {
    expect(nameScore('Time Out Market', 'Time Out Market Lisboa')).toBe(1)
    expect(nameScore('Belém Tower', 'Torre de Belém')).toBe(0.5)
    expect(nameScore('A nice café', 'Pastelaria')).toBe(0)
    expect(nameScore('', 'Anything')).toBe(0)
  })
})

describe('matchPlace', () => {
  it('accepts a real place even when OSM spells it a little differently', () => {
    const hit = matchPlace('Time Out Market', [
      place('Time Out Market Lisboa', 'food_court', 'amenity'),
    ])
    expect(hit?.name).toBe('Time Out Market Lisboa')
  })

  it('picks the closest name among several results', () => {
    const hit = matchPlace('Museu Nacional do Azulejo', [
      place('Museu Nacional de Arte Antiga', 'museum'),
      place('Museu Nacional do Azulejo', 'museum'),
    ])
    expect(hit?.name).toBe('Museu Nacional do Azulejo')
  })

  it('drops invented places that Nominatim only half-matches', () => {
    expect(
      matchPlace('Golden Sunset Rooftop Bar Alfama', [place('Alfama', 'suburb', 'place')]),
    ).toBeNull()
    expect(matchPlace('Anything', [])).toBeNull()
  })

  it('never takes a bus stop or a street named after the place', () => {
    expect(
      matchPlace('Mosteiro dos Jerónimos', [
        place('Mosteiro dos Jerónimos', 'bus_stop', 'highway'),
        place('Mosteiro dos Jerónimos', 'platform', 'public_transport'),
      ]),
    ).toBeNull()
  })
})
