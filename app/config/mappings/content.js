module.exports = {
    "properties": {
      "uuid": {
        "type": "text"
      },
      "fields": {
        "type": "object", 
        "properties": {
          "titel": {
            "type": "text"
          },
          "inhoud": {
            "type": "text"
          },
          "introtekst": {
            "type": "text"
          },
          "locatie": {
            "type": "object", 
            "properties": {
              "website": { 
                "type": "object", 
                "properties": {
                  "url": {
                    "type": "text"
                  },
                  "description": {
                    "type": "text"
                  },
                },
              },
              "naam": {
                "type": "text"
              },
              "straatNr": {
                "type": "text"
              },
              "postcode": {
                "type": "text"
              },
              "gemeente": {
                "type": "text"
              },
              "telefoonnummer": {
                "type": "text"
              },
              "emailadres": {
                "type": "text"
              },
              "coordinaten": { 
                "type": "object", 
                "properties": {
                  "lat": {
                    "type": "double"
                  },
                  "lng": {
                    "type": "double"
                  },
                }
              }
            }
          },
          "synoniemen": [],
          "paragrafen": [],
          "activiteit": {
            "type": "object", 
            "properties": {
              "leeftijdscategorie": {
                "type": "text" 
              },
              "reservatieUrl": {
                "type": "text" 
              },
              "reservatieTekst": {
                "type": "text" 
              },
              "datums": {
                  "type": "nested",
                  "properties": {
                    "datumVanaf": {
                      "type": "date"
                    },
                    "datumTot": {
                      "type": "date"
                    },
                    "uurVanaf": {
                      "type": "date"
                    },
                    "uurTot": {
                      "type": "date"
                    }
                  }
              },
              "afbeelding": {
                "type" : "object",
                "properties": {
                  "url": {
                    "type": "text"
                  },
                  "copyright": {
                    "type": "text"
                  },
                  "onderschrift": {
                    "type": "text"
                  },
                }
              },              
              "locatie": {
                "type" : "object",
                "properties": {
                  "naam": {
                    "type": "text"
                  },
                  "straat": {
                    "type": "text"
                  },
                  "huisnummer": {
                    "type": "text"
                  },
                  "postcode": {
                    "type": "text"
                  },
                  "gemeente": {
                    "type": "text"
                  }
                }
              },          
              "organisatie": {
                "type" : "object",
                "properties": {
                  "naam": {
                    "type": "text"
                  },
                  "email": {
                    "type": "text"
                  },
                  "telefoon": {
                    "type": "text"
                  }
                }
              }              
            }
          },
          "partner": {
            "type": "object", 
            "properties": {
                "naam": {
                  "type": "text"
                },
                "omschrijving": {
                  "type": "text"
                },
                "website": {
                  "type": "text"
                },
                "type": {
                  "type": "text"
                }
            }
          }
        }
      },
      "meta" : {
        "type": "object",
        "properties" : {
          "activeLanguages": [],
          "contentType" : {
            "type": "text"
          },
          "created" : {
            "type": "date"
          },
          "lastModified" : {
            "type": "date"
          },
          "publishDate" : {
            "type": "date"
          },
          "slug" : {
            "type": "text"
          },
          "taxonomy" : {
            "type": "object",
            "properties" : {
                "tags": []
            }
          }
        }
      }   
    }
};
