### faire les permissions 
### faire les rôles
### faire les users 
### faire les écoles ????
### poser des guards sur les routes de création de rôles
### les permissions que le front doit envoyer doivent correspondre au format "ACTION_cibleAction"*
### supprimer de la modélisation prisma et du permissions.constants.ts, les permissions qui ne sont pas censées apparaître au niveau des utilisateurs et sont spécifiques au backoffice. C'est en se basant sur cette modification qu'on a pas besoin de vérifier si celui qui crée un rôle a bien le droit de donner tel ou tel permission.

### on sépare le backend user du backend backoffice

### pourquoi on utilise CASL, c'est pour pouvoir mieux gérer les permissions en fonction de tel ou tel champ (comme les ids). ça va nous éviter de contrôler ces champs à chaque fois dans le service. Direct on sait bloque la requête si nécessaire au niveau du contrôleur.

### un user peut avoir un seul profil parent qui lui peut être relié à plusieurs enfants dans différentes écoles. Ainsi la mise à jour des informations du parent est centralisée, pas besoin de modifier celà partout.


### dans le clerk-auth.guard.ts on vérifie le présence du secret dans l'environnement à chaque requête. Essayons de le faire de manière globale si possible
