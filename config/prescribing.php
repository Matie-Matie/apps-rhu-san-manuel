<?php

// Single source of truth for the select-only prescription fields. The form
// renders these and the controller validates against them.
return [
    'dosages' => [
        '1/2 tablet', '1 tablet', '2 tablets', '1 capsule', '2 capsules', '1 sachet',
        '5 mL (1 tsp)', '10 mL (2 tsp)', '15 mL (1 tbsp)', '1 ampule', '1 vial',
        '1 drop', '2 drops', '1 puff', '2 puffs', '1 application', '1 suppository',
    ],

    'frequencies' => [
        'Once a day (OD)',
        'Twice a day (BID)',
        '3 times a day (TID)',
        '4 times a day (QID)',
        'Every 4 hours',
        'Every 6 hours',
        'Every 8 hours',
        'Every 12 hours',
        'At bedtime (HS)',
        'Once a week',
        'As needed (PRN)',
        'Single dose (STAT)',
    ],

    'durations' => [
        '1 day', '2 days', '3 days', '4 days', '5 days', '7 days', '10 days',
        '14 days', '21 days', '30 days', '2 months', '3 months', 'Maintenance (ongoing)',
    ],

    'quantities' => array_merge(range(1, 200), [250, 300, 400, 500, 1000]),

    // Dispensing unit per prescription item (client: per piece / per banig / per box).
    'units' => [
        'piece',
        'banig',
        'box',
    ],

    'common_diagnoses' => [
        'Acute Respiratory Infection', 'Hypertension', 'Diabetes Mellitus Type 2',
        'Urinary Tract Infection', 'Acute Gastroenteritis', 'Pneumonia', 'Fever',
        'Skin Infection', 'Allergic Rhinitis', 'Headache', 'Dyspepsia', 'Asthma',
    ],
];
