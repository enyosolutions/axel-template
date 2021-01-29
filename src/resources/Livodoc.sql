CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `email` email,
  `firstName` varchar(255),
  `lastName` varchar(255),
  `password` password,
  `avatar` URL
);

CREATE TABLE `admins` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `roles` varchar(255)
);

CREATE TABLE `patients` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `usageTime` int,
  `weight` int,
  `birthdate` datetime,
  `gender` ENUM ('male', 'female'),
  `userId` int,
  `doctorId` int,
  `initialAssessmentCompleted` bool,
  `emailNotifications` bool,
  `acceptedTermsId` int,
  `acceptedConditionsId` int
);

CREATE TABLE `doctors` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `emailNotifications` bool,
  `acceptedTermsId` int,
  `acceptedConditionsId` int
);

CREATE TABLE `goals` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `status` ENUM ('new', 'onGoing', 'done'),
  `title` varchar(255),
  `duration` int,
  `expectedStartDate` datetime,
  `startDate` datetime,
  `expectedEndDate` datetime,
  `endDate` datetime,
  `notifications` bool
);

CREATE TABLE `indicators` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `date` datetime,
  `indicator1` int,
  `indicator2` int,
  `indicator3` int,
  `indicator4` int,
  `indicator5` int,
  `indicator6` int,
  `indicator7` int,
  `indicator8` int,
  `indicator9` int
);

CREATE TABLE `progras` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `summary` HTML,
  `quizz1` int,
  `quizz2` int,
  `quizz3` int,
  `duration` int
);

CREATE TABLE `patientsPrograms` (
  `patientId` int,
  `programId` int,
  `status` ENUM ('new', 'onGoing', 'done')
);

CREATE TABLE `modules` (
  `order` int,
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `programId` int,
  `summary` HTML,
  `type` ENUM ('nutrition', 'equilibre', 'forme', 'phytotherapie')
);

CREATE TABLE `workshops` (
  `order` int,
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `moduleId` int,
  `title` varchar(255),
  `summary` HTML
);


CREATE TABLE `chapters` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `order` int,
  `status` ENUM ('new', 'onGoing', 'done'),
  `workshopsPartId` int,
  `title` varchar(255),
  `content` HTML
);

CREATE TABLE `workshopsSections` (
  `order` int,
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `workshopId` int,
  `title` varchar(255),
  `subtitle` varchar(255)
);

CREATE TABLE `workshopsSectionsChapters` (
  `chapterId` int,
  `sectionId` int
);

CREATE TABLE `workshopsSectionsQuizzes` (
  `quizzId` int,
  `sectionId` int
);


CREATE TABLE `usersChapters` (
  `patientId` int,
  `chapterId` ind,
  `status` ENUM ('new', 'onGoing', 'done'),
  `progression` int,
  `completedOn` timestamp
);

CREATE TABLE `quizz` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `isInitialAssessment` bool
);

CREATE TABLE `quizzRating` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `quizzId` ind,
  `level` int,
  `title` varchar(255),
  `content` HTML
);

CREATE TABLE `quizzQuestions` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `quizzId` int,
  `type` ENUM ('singleChoice', 'multipleChoice', 'open'),
  `title` varchar(255),
  `possibleAnswers` array,
  `rightAnswers` array
);

CREATE TABLE `quizzAnswers` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `quizzQuestionId` int,
  `userId` int,
  `answers` array
);

CREATE TABLE `quizzResults` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `questionId` int,
  `userId` int,
  `score` int,
  `rating` varchar(255),
  `progression` int,
  `completedOn` timestamp
);

CREATE TABLE `modules` (
  `order` int,
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `programId` int,
  `summary` text,
  `type` ENUM ('nutrition', 'equilibre', 'forme', 'phytotherapie')
);

CREATE TABLE `workshops` (
  `order` int,
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `moduleId` int,
  `title` varchar(255),
  `summary` text

);


CREATE TABLE `chapters` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `order` int,
  `status` ENUM ('new', 'onGoing', 'done'),
  `workshopsPartId` int,
  `title` varchar(255),
  `content` TEXT
);



CREATE TABLE `medias` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `type` ENUM ('podcast', 'video', 'recipe', 'page'),
  `title` varchar(255),
  `mainMedia` varchar(255),
  `thumbnail` varchar(255),
  `videoLenght` varchar(255),
  `content` text,
  `viewsCount` int
);


CREATE TABLE `FAQ` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `content` text
);

CREATE TABLE `patientsFavorites` (
  `patientId` int,
  `mediaId` int
);


CREATE TABLE `badges` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `conditions` varchar(255),
  `image` URL
);

CREATE TABLE `patientsBadges` (
  `patientId` int,
  `badgeId` int
);

CREATE TABLE `notifications` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `userId` int,
  `date` datetime,
  `isRead` bool,
  `type` notificationsType,
  `message` varchar(255)
);

CREATE TABLE `websiteSettings` (
  `id` int  PRIMARY KEY AUTO_INCREMENT,
  `setting` value
);

ALTER TABLE `admins` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `patients` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `patients` ADD FOREIGN KEY (`doctorId`) REFERENCES `doctors` (`id`);

ALTER TABLE `doctors` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

ALTER TABLE `goals` ADD FOREIGN KEY (`userId`) REFERENCES `patients` (`id`);

ALTER TABLE `indicators` ADD FOREIGN KEY (`userId`) REFERENCES `patients` (`id`);

ALTER TABLE `programs` ADD FOREIGN KEY (`quizz1`) REFERENCES `quizz` (`id`);

ALTER TABLE `programs` ADD FOREIGN KEY (`quizz2`) REFERENCES `quizz` (`id`);

ALTER TABLE `programs` ADD FOREIGN KEY (`quizz3`) REFERENCES `quizz` (`id`);

ALTER TABLE `patientsPrograms` ADD FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`);

ALTER TABLE `patientsPrograms` ADD FOREIGN KEY (`programId`) REFERENCES `programs` (`id`);

ALTER TABLE `modules` ADD FOREIGN KEY (`programId`) REFERENCES `programs` (`id`);

ALTER TABLE `workshops` ADD FOREIGN KEY (`moduleId`) REFERENCES `modules` (`id`);

ALTER TABLE `workshopsSections` ADD FOREIGN KEY (`workshopId`) REFERENCES `workshops` (`id`);

ALTER TABLE `workshopsSectionsChapters` ADD FOREIGN KEY (`chapterId`) REFERENCES `chapters` (`id`);

ALTER TABLE `workshopsSectionsChapters` ADD FOREIGN KEY (`sectionId`) REFERENCES `workshopsSections` (`id`);

ALTER TABLE `workshopsSectionsQuizzes` ADD FOREIGN KEY (`quizzId`) REFERENCES `chapters` (`id`);

ALTER TABLE `workshopsSectionsQuizzes` ADD FOREIGN KEY (`sectionId`) REFERENCES `workshopsSections` (`id`);

ALTER TABLE `chapters` ADD FOREIGN KEY (`workshopsPartId`) REFERENCES `workshopsSections` (`id`);

ALTER TABLE `usersChapters` ADD FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`);

ALTER TABLE `usersChapters` ADD FOREIGN KEY (`chapterId`) REFERENCES `chapters` (`id`);

ALTER TABLE `quizzRating` ADD FOREIGN KEY (`quizzId`) REFERENCES `quizz` (`id`);

ALTER TABLE `quizzQuestions` ADD FOREIGN KEY (`quizzId`) REFERENCES `quizz` (`id`);

ALTER TABLE `quizzAnswers` ADD FOREIGN KEY (`quizzQuestionId`) REFERENCES `quizzQuestions` (`id`);

ALTER TABLE `quizzAnswers` ADD FOREIGN KEY (`userId`) REFERENCES `patients` (`id`);

ALTER TABLE `quizzResults` ADD FOREIGN KEY (`questionId`) REFERENCES `quizz` (`id`);

ALTER TABLE `quizzResults` ADD FOREIGN KEY (`userId`) REFERENCES `patients` (`id`);

ALTER TABLE `patientsFavorites` ADD FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`);

ALTER TABLE `patientsFavorites` ADD FOREIGN KEY (`mediaId`) REFERENCES `medias` (`id`);

ALTER TABLE `patientsBadges` ADD FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`);

ALTER TABLE `patientsBadges` ADD FOREIGN KEY (`badgeId`) REFERENCES `badges` (`id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`userId`) REFERENCES `users` (`id`);
