-- ============================================
-- THE PROJECT - Insertion des exercices uniquement
-- ============================================
-- Exécutez ce script si les tables existent déjà
-- ============================================

-- Vider la table si nécessaire (optionnel)
-- DELETE FROM exercise_library;

-- Insérer les exercices
INSERT INTO exercise_library (name_fr, name_en, muscle_group, secondary_muscles, equipment, difficulty, instructions_fr) VALUES

-- POITRINE (CHEST)
('Développé couché', 'Bench Press', 'chest', ARRAY['triceps', 'shoulders'], 'barbell', 'intermediate', 
 'Allongé sur un banc plat, saisissez la barre avec une prise légèrement plus large que les épaules. Descendez la barre vers le milieu de la poitrine, puis poussez.'),

('Développé couché incliné', 'Incline Bench Press', 'chest', ARRAY['triceps', 'shoulders'], 'barbell', 'intermediate',
 'Sur un banc incliné à 30-45°, effectuez le même mouvement que le développé couché classique.'),

('Développé couché haltères', 'Dumbbell Bench Press', 'chest', ARRAY['triceps', 'shoulders'], 'dumbbell', 'beginner',
 'Allongé sur un banc, un haltère dans chaque main. Poussez les haltères vers le haut en contractant les pectoraux.'),

('Écarté couché', 'Dumbbell Fly', 'chest', ARRAY['shoulders'], 'dumbbell', 'intermediate',
 'Allongé, bras tendus au-dessus de la poitrine. Ouvrez les bras en arc de cercle, puis revenez à la position initiale.'),

('Pompes', 'Push-ups', 'chest', ARRAY['triceps', 'shoulders', 'core'], 'bodyweight', 'beginner',
 'Position de planche, mains légèrement plus larges que les épaules. Descendez le corps en fléchissant les coudes, puis poussez.'),

('Dips', 'Dips', 'chest', ARRAY['triceps', 'shoulders'], 'bodyweight', 'intermediate',
 'Sur des barres parallèles, penchez-vous légèrement vers l''avant. Descendez jusqu''à 90° aux coudes, puis remontez.'),

('Pec Deck', 'Pec Deck Machine', 'chest', ARRAY[]::TEXT[], 'machine', 'beginner',
 'Assis sur la machine, ramenez les bras vers le centre en contractant les pectoraux.'),

-- DOS (BACK)
('Tractions', 'Pull-ups', 'back', ARRAY['biceps', 'shoulders'], 'bodyweight', 'intermediate',
 'Suspendez-vous à une barre, paumes vers l''avant. Tirez-vous vers le haut jusqu''à ce que le menton dépasse la barre.'),

('Tractions supination', 'Chin-ups', 'back', ARRAY['biceps'], 'bodyweight', 'intermediate',
 'Comme les tractions, mais paumes vers vous. Cible davantage les biceps.'),

('Rowing barre', 'Barbell Row', 'back', ARRAY['biceps', 'core'], 'barbell', 'intermediate',
 'Penché vers l''avant, tirez la barre vers le nombril en contractant les dorsaux.'),

('Rowing haltère', 'Dumbbell Row', 'back', ARRAY['biceps'], 'dumbbell', 'beginner',
 'Un genou et une main sur un banc, tirez l''haltère vers la hanche avec l''autre bras.'),

('Tirage vertical', 'Lat Pulldown', 'back', ARRAY['biceps'], 'cable', 'beginner',
 'Assis à la machine, tirez la barre vers le haut de la poitrine.'),

('Tirage horizontal', 'Seated Cable Row', 'back', ARRAY['biceps'], 'cable', 'beginner',
 'Assis, tirez la poignée vers le ventre en gardant le dos droit.'),

('Soulevé de terre', 'Deadlift', 'back', ARRAY['legs', 'core', 'glutes'], 'barbell', 'advanced',
 'Pieds à largeur des hanches, soulevez la barre du sol en gardant le dos droit.'),

('Soulevé de terre roumain', 'Romanian Deadlift', 'back', ARRAY['hamstrings', 'glutes'], 'barbell', 'intermediate',
 'Debout avec la barre, descendez en gardant les jambes quasi tendues, puis remontez.'),

-- ÉPAULES (SHOULDERS)
('Développé militaire', 'Overhead Press', 'shoulders', ARRAY['triceps'], 'barbell', 'intermediate',
 'Debout, poussez la barre au-dessus de la tête en partant des épaules.'),

('Développé haltères', 'Dumbbell Shoulder Press', 'shoulders', ARRAY['triceps'], 'dumbbell', 'beginner',
 'Assis ou debout, poussez les haltères au-dessus de la tête.'),

('Élévations latérales', 'Lateral Raises', 'shoulders', ARRAY[]::TEXT[], 'dumbbell', 'beginner',
 'Bras le long du corps, levez les haltères sur les côtés jusqu''à hauteur d''épaules.'),

('Élévations frontales', 'Front Raises', 'shoulders', ARRAY[]::TEXT[], 'dumbbell', 'beginner',
 'Levez les haltères devant vous jusqu''à hauteur d''épaules.'),

('Oiseau', 'Rear Delt Fly', 'shoulders', ARRAY['back'], 'dumbbell', 'intermediate',
 'Penché vers l''avant, levez les haltères sur les côtés pour cibler l''arrière des épaules.'),

('Face Pull', 'Face Pull', 'shoulders', ARRAY['back'], 'cable', 'beginner',
 'Tirez la corde vers le visage en écartant les mains, coudes hauts.'),

-- BICEPS
('Curl barre', 'Barbell Curl', 'biceps', ARRAY['forearms'], 'barbell', 'beginner',
 'Debout, montez la barre en fléchissant les coudes, gardez les coudes fixes.'),

('Curl haltères', 'Dumbbell Curl', 'biceps', ARRAY['forearms'], 'dumbbell', 'beginner',
 'Alternez ou simultanément, montez les haltères en supination.'),

('Curl marteau', 'Hammer Curl', 'biceps', ARRAY['forearms'], 'dumbbell', 'beginner',
 'Comme le curl haltères, mais paumes face à face (prise neutre).'),

('Curl pupitre', 'Preacher Curl', 'biceps', ARRAY[]::TEXT[], 'barbell', 'intermediate',
 'Appuyé sur le pupitre, effectuez un curl en isolation.'),

('Curl concentré', 'Concentration Curl', 'biceps', ARRAY[]::TEXT[], 'dumbbell', 'beginner',
 'Assis, coude contre la cuisse, effectuez un curl en isolation.'),

-- TRICEPS
('Extension triceps poulie', 'Tricep Pushdown', 'triceps', ARRAY[]::TEXT[], 'cable', 'beginner',
 'Poussez la barre ou la corde vers le bas en gardant les coudes fixes.'),

('Extension nuque', 'Overhead Tricep Extension', 'triceps', ARRAY[]::TEXT[], 'dumbbell', 'beginner',
 'Tenez un haltère au-dessus de la tête, descendez derrière la nuque.'),

('Barre au front', 'Skull Crushers', 'triceps', ARRAY[]::TEXT[], 'barbell', 'intermediate',
 'Allongé, descendez la barre vers le front en gardant les coudes fixes.'),

('Dips triceps', 'Bench Dips', 'triceps', ARRAY['chest', 'shoulders'], 'bodyweight', 'beginner',
 'Mains sur un banc derrière vous, descendez en fléchissant les coudes.'),

('Kickback', 'Tricep Kickback', 'triceps', ARRAY[]::TEXT[], 'dumbbell', 'beginner',
 'Penché, tendez le bras vers l''arrière en gardant le coude fixe.'),

-- JAMBES (LEGS)
('Squat', 'Back Squat', 'legs', ARRAY['core', 'glutes'], 'barbell', 'intermediate',
 'Barre sur les trapèzes, descendez jusqu''à ce que les cuisses soient parallèles au sol.'),

('Squat avant', 'Front Squat', 'legs', ARRAY['core', 'glutes'], 'barbell', 'advanced',
 'Barre sur les épaules avant, descendez en gardant le buste droit.'),

('Squat goblet', 'Goblet Squat', 'legs', ARRAY['core'], 'dumbbell', 'beginner',
 'Tenez un haltère ou kettlebell contre la poitrine, effectuez un squat.'),

('Presse à cuisses', 'Leg Press', 'legs', ARRAY['glutes'], 'machine', 'beginner',
 'Sur la machine, poussez la plateforme avec les pieds.'),

('Fentes', 'Lunges', 'legs', ARRAY['glutes', 'core'], 'bodyweight', 'beginner',
 'Faites un grand pas en avant, descendez jusqu''à ce que le genou arrière frôle le sol.'),

('Fentes marchées', 'Walking Lunges', 'legs', ARRAY['glutes', 'core'], 'dumbbell', 'intermediate',
 'Effectuez des fentes en avançant à chaque répétition.'),

('Leg extension', 'Leg Extension', 'legs', ARRAY[]::TEXT[], 'machine', 'beginner',
 'Assis, tendez les jambes pour travailler les quadriceps.'),

('Leg curl', 'Leg Curl', 'legs', ARRAY[]::TEXT[], 'machine', 'beginner',
 'Allongé ou assis, fléchissez les jambes pour travailler les ischio-jambiers.'),

('Hip Thrust', 'Hip Thrust', 'legs', ARRAY['glutes', 'core'], 'barbell', 'intermediate',
 'Dos contre un banc, poussez les hanches vers le haut avec la barre sur le bassin.'),

('Mollets debout', 'Standing Calf Raise', 'legs', ARRAY[]::TEXT[], 'machine', 'beginner',
 'Sur la pointe des pieds, montez et descendez lentement.'),

('Mollets assis', 'Seated Calf Raise', 'legs', ARRAY[]::TEXT[], 'machine', 'beginner',
 'Assis avec les poids sur les genoux, effectuez des élévations de mollets.'),

-- ABDOMINAUX (CORE)
('Crunch', 'Crunch', 'core', ARRAY[]::TEXT[], 'bodyweight', 'beginner',
 'Allongé, soulevez les épaules du sol en contractant les abdominaux.'),

('Planche', 'Plank', 'core', ARRAY['shoulders'], 'bodyweight', 'beginner',
 'Position de gainage, maintenez le corps aligné pendant la durée prescrite.'),

('Planche latérale', 'Side Plank', 'core', ARRAY['shoulders'], 'bodyweight', 'intermediate',
 'Sur le côté, corps aligné, maintenez la position.'),

('Relevé de jambes', 'Leg Raise', 'core', ARRAY[]::TEXT[], 'bodyweight', 'intermediate',
 'Allongé ou suspendu, levez les jambes tendues vers le haut.'),

('Russian Twist', 'Russian Twist', 'core', ARRAY[]::TEXT[], 'bodyweight', 'beginner',
 'Assis, penché en arrière, tournez le buste de gauche à droite.'),

('Ab Wheel', 'Ab Wheel Rollout', 'core', ARRAY['shoulders'], 'bodyweight', 'advanced',
 'À genoux avec la roue, roulez vers l''avant puis revenez.'),

('Mountain Climber', 'Mountain Climbers', 'core', ARRAY['shoulders', 'legs'], 'bodyweight', 'beginner',
 'En position de planche, ramenez alternativement les genoux vers la poitrine.')

ON CONFLICT DO NOTHING;

