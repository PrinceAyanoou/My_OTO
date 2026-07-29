SELECT
  `u`.`id` AS `user_id`,
  `u`.`clerkUserId` AS `clerk_user_id`,
  'EMPLOYE' AS `type_utilisateur`,
  `r`.`ecoleId` AS `ecole_id`,
  `p`.`action` AS `action`,
  `p`.`cible` AS `cible`,
  NULL AS `apprenant_id`
FROM
  (
    (
      (
        (
          (
            `oto`.`user` `u`
            JOIN `oto`.`employe` `e` ON(`e`.`clerkUserId` = `u`.`clerkUserId`)
          )
          JOIN `oto`.`employerole` `er` ON(`er`.`employeId` = `e`.`id`)
        )
        JOIN `oto`.`role` `r` ON(`r`.`id` = `er`.`roleId`)
      )
      JOIN `oto`.`rolepermission` `rp` ON(`rp`.`roleId` = `r`.`id`)
    )
    JOIN `oto`.`permission` `p` ON(`p`.`id` = `rp`.`permissionId`)
  )
UNION
ALL
SELECT
  `u`.`id` AS `user_id`,
  `u`.`clerkUserId` AS `clerk_user_id`,
  'PARENT' AS `type_utilisateur`,
  `ans`.`ecoleId` AS `ecole_id`,
  NULL AS `action`,
  NULL AS `cible`,
  `a`.`id` AS `apprenant_id`
FROM
  (
    (
      (
        (
          (
            `oto`.`user` `u`
            JOIN `oto`.`parent` `par` ON(`par`.`userId` = `u`.`id`)
          )
          JOIN `oto`.`apprenantparent` `ap` ON(`ap`.`parentId` = `par`.`id`)
        )
        JOIN `oto`.`apprenant` `a` ON(`a`.`id` = `ap`.`apprenantId`)
      )
      JOIN `oto`.`inscription` `i` ON(`i`.`apprenantId` = `a`.`id`)
    )
    JOIN `oto`.`anneescolaire` `ans` ON(`ans`.`id` = `i`.`anneeScolaireId`)
  )
UNION
ALL
SELECT
  `u`.`id` AS `user_id`,
  `u`.`clerkUserId` AS `clerk_user_id`,
  'APPRENANT' AS `type_utilisateur`,
  `ans`.`ecoleId` AS `ecole_id`,
  NULL AS `action`,
  NULL AS `cible`,
  `a`.`id` AS `apprenant_id`
FROM
  (
    (
      (
        `oto`.`user` `u`
        JOIN `oto`.`apprenant` `a` ON(`a`.`userId` = `u`.`id`)
      )
      JOIN `oto`.`inscription` `i` ON(`i`.`apprenantId` = `a`.`id`)
    )
    JOIN `oto`.`anneescolaire` `ans` ON(`ans`.`id` = `i`.`anneeScolaireId`)
  )