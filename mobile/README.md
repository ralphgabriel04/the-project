# mobile/

Placeholder pour l'app mobile Cadence (React Native + Expo SDK 54).

## Code source

Le code mobile vit dans un repo separe :
**[ralphgabriel04/cadence-mobile](https://github.com/ralphgabriel04/cadence-mobile)**

Ce dossier existe pour marquer la place du mobile dans la structure monorepo. Le code n'est pas duplique ici.

## Stack mobile

- React Native 0.81
- Expo SDK 54
- NativeWind 4 (Tailwind pour RN)
- Supabase (meme backend que le web)
- TypeScript strict

## Pourquoi un repo separe ?

- EAS Build (Expo Application Services) fonctionne mieux avec un repo dedie
- CI/CD mobile a des contraintes differentes (builds iOS/Android, signing, store review)
- Les releases mobile et web ont des cycles differents
- A terme, une integration dans le monorepo est envisageable si le workflow le justifie
