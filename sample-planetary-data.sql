-- Insert sample planetary data for testing
-- Based on the format you provided earlier

INSERT INTO daily_planets (date, planetary_data) VALUES 
(
    '2025-09-18',
    '[
      {
        "id": 0,
        "name": "Sun",
        "rasi": {
          "id": 5,
          "lord": {
            "id": 2,
            "name": "Mercury",
            "vedic_name": "Budha"
          },
          "name": "Kanya"
        },
        "degree": 0.9038838229538158,
        "position": 6,
        "longitude": 150.90388382295382,
        "is_retrograde": false
      },
      {
        "id": 1,
        "name": "Moon",
        "rasi": {
          "id": 3,
          "lord": {
            "id": 1,
            "name": "Moon",
            "vedic_name": "Chandra"
          },
          "name": "Karka"
        },
        "degree": 13.072601467385809,
        "position": 4,
        "longitude": 103.07260146738581,
        "is_retrograde": false
      },
      {
        "id": 2,
        "name": "Mercury",
        "rasi": {
          "id": 5,
          "lord": {
            "id": 2,
            "name": "Mercury",
            "vedic_name": "Budha"
          },
          "name": "Kanya"
        },
        "degree": 4.618327746284194,
        "position": 6,
        "longitude": 154.6183277462842,
        "is_retrograde": false
      },
      {
        "id": 3,
        "name": "Venus",
        "rasi": {
          "id": 4,
          "lord": {
            "id": 0,
            "name": "Sun",
            "vedic_name": "Ravi"
          },
          "name": "Simha"
        },
        "degree": 3.6402229339361156,
        "position": 5,
        "longitude": 123.64022293393612,
        "is_retrograde": false
      },
      {
        "id": 4,
        "name": "Mars",
        "rasi": {
          "id": 6,
          "lord": {
            "id": 3,
            "name": "Venus",
            "vedic_name": "Shukra"
          },
          "name": "Tula"
        },
        "degree": 2.732162900625866,
        "position": 7,
        "longitude": 182.73216290062587,
        "is_retrograde": false
      },
      {
        "id": 5,
        "name": "Jupiter",
        "rasi": {
          "id": 2,
          "lord": {
            "id": 2,
            "name": "Mercury",
            "vedic_name": "Budha"
          },
          "name": "Mithuna"
        },
        "degree": 26.436869166912388,
        "position": 3,
        "longitude": 86.43686916691239,
        "is_retrograde": false
      },
      {
        "id": 6,
        "name": "Saturn",
        "rasi": {
          "id": 11,
          "lord": {
            "id": 5,
            "name": "Jupiter",
            "vedic_name": "Guru"
          },
          "name": "Meena"
        },
        "degree": 4.562472664476445,
        "position": 12,
        "longitude": 334.56247266447645,
        "is_retrograde": true
      }
    ]'::jsonb
),
(
    '2025-09-19',
    '[
      {
        "id": 0,
        "name": "Sun",
        "rasi": {
          "id": 5,
          "lord": {
            "id": 2,
            "name": "Mercury",
            "vedic_name": "Budha"
          },
          "name": "Kanya"
        },
        "degree": 1.9038838229538158,
        "position": 6,
        "longitude": 151.90388382295382,
        "is_retrograde": false
      },
      {
        "id": 1,
        "name": "Moon",
        "rasi": {
          "id": 4,
          "lord": {
            "id": 0,
            "name": "Sun",
            "vedic_name": "Ravi"
          },
          "name": "Simha"
        },
        "degree": 25.072601467385809,
        "position": 5,
        "longitude": 115.07260146738581,
        "is_retrograde": false
      },
      {
        "id": 2,
        "name": "Mercury",
        "rasi": {
          "id": 5,
          "lord": {
            "id": 2,
            "name": "Mercury",
            "vedic_name": "Budha"
          },
          "name": "Kanya"
        },
        "degree": 5.618327746284194,
        "position": 6,
        "longitude": 155.6183277462842,
        "is_retrograde": false
      }
    ]'::jsonb
);

-- Verify the data was inserted
SELECT date, jsonb_array_length(planetary_data) as planet_count 
FROM daily_planets 
ORDER BY date;
