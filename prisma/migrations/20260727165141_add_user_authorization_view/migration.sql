CREATE OR REPLACE VIEW user_authorization_context AS
SELECT 
    u.id AS user_id,
    u.clerkUserId AS clerk_user_id,
    'EMPLOYE' AS type_utilisateur,
    r.ecoleId AS ecole_id,
    p.action AS action,
    p.cible AS cible,
    NULL AS apprenant_id
FROM `User` u
JOIN `Employe` e ON e.clerkUserId = u.clerkUserId
JOIN `EmployeRole` er ON er.employeId = e.id
JOIN `Role` r ON r.id = er.roleId
JOIN `RolePermission` rp ON rp.roleId = r.id
JOIN `Permission` p ON p.id = rp.permissionId

UNION ALL

SELECT 
    u.id AS user_id,
    u.clerkUserId AS clerk_user_id,
    'PARENT' AS type_utilisateur,
    ans.ecoleId AS ecole_id,
    NULL AS action,
    NULL AS cible,
    a.id AS apprenant_id
FROM `User` u
JOIN `Parent` par ON par.userId = u.id
JOIN `ApprenantParent` ap ON ap.parentId = par.id
JOIN `Apprenant` a ON a.id = ap.apprenantId
JOIN `Inscription` i ON i.apprenantId = a.id
JOIN `AnneeScolaire` ans ON ans.id = i.anneeScolaireId

UNION ALL

SELECT 
    u.id AS user_id,
    u.clerkUserId AS clerk_user_id,
    'APPRENANT' AS type_utilisateur,
    ans.ecoleId AS ecole_id,
    NULL AS action,
    NULL AS cible,
    a.id AS apprenant_id
FROM `User` u
JOIN `Apprenant` a ON a.userId = u.id
JOIN `Inscription` i ON i.apprenantId = a.id
JOIN `AnneeScolaire` ans ON ans.id = i.anneeScolaireId;