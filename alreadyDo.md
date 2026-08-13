### je peux Créer, modifier, supprimer, lire les rôles. 

### j'ai un guard et son décorateur pour protéger mes routes. Vérifie si celui qui tente d'accéder à la route à les permissions requises pour celle-ci

### création user et crud prisma + clerk + affichage des user par filtre
### s'assurer que si l'utilisateur modifie son email sur clerk alors l'email est automatiquement mise à jour dans la db. Utiliser un webhook pour ça
### connexion utilisateur 
### CRUD école. create = faire une demande de création qui sera envoyé surtout au backoffice qui la validera ou non. Modifier les infos d'une école est réserver au backoffice. L'école envoie les modifications et c'est le backoffice qui validera celà après vérification. Suppression = envoyée une demande de suppression.
### ajouter un user à une école, le supprimer. En l'ajoutant, on peut spécifier son profil.
### on peut créer un employé même si ce dernier n'a pas de compte user, on lui envoie une invitation avec clerk puis il entre juste son mdp, les autres infos seront remplis préalablement par la personne inscrivant l'employé (à priori la sécrétaire je suppose mais ça n'a pas d'importance.)
### backoffice pour s'occuper des demandes de l'école.
### mise à jour du webhook clerk afin de savoir quand est-ce que l'emplpyé a accepté notre invitation afin de modifier son statut et son clerkuserId automatiquement.

### s'occuper de Employe




### faire le système de classe, de matiere, de prof affilié à une classe pour une matière à une heure donnée.

### s'assurer que les rôles soient bien injecté dans le jwt clerk.


