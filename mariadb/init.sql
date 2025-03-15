-- 创建数据库
CREATE DATABASE IF NOT EXISTS uicinfocenter;

-- 使用数据库
USE uicinfocenter;

-- 删除数据表
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `jwt_token_blocklist`;
DROP TABLE IF EXISTS `course`;
DROP TABLE IF EXISTS `section`;
DROP TABLE IF EXISTS `teacher`;
DROP TABLE IF EXISTS `teacher_info`;
DROP TABLE IF EXISTS `nav_category`;
DROP TABLE IF EXISTS `nav_webaddr`;
DROP TABLE IF EXISTS `forum_thread`;
DROP TABLE IF EXISTS `forum_reply`;

-- 创建数据表
-- uicinfocenter.`user` definition
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `username` varchar(32) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` text NOT NULL,
  `user_type` enum('ADMIN','TEACHER','STUDENT','ALUMNI','GUEST') NOT NULL,
  `account_status` enum('ACTIVE','INACTIVE') NOT NULL,
  `default_entrypoint` varchar(128) DEFAULT NULL,
  `jwt_auth_active` tinyint(1) DEFAULT NULL,
  `last_online` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.jwt_token_blocklist definition
CREATE TABLE `jwt_token_blocklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jwt_token` text NOT NULL,
  `token_type` enum('token','vCode') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `jwt_token` (`jwt_token`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.course definition
CREATE TABLE `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_code` varchar(255) NOT NULL,
  `name_en` varchar(255) NOT NULL,
  `name_cn` varchar(255) DEFAULT NULL,
  `units` int(11) NOT NULL,
  `curriculum_type` varchar(255) NOT NULL,
  `elective_type` varchar(255) DEFAULT NULL,
  `offering_faculty` varchar(255) DEFAULT NULL,
  `offering_programme` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `prerequisites` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `course_code` (`course_code`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.`section` definition
CREATE TABLE `section` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `offer_semester` text DEFAULT NULL,
  `section_number` varchar(255) NOT NULL,
  `classroom` varchar(255) DEFAULT NULL,
  `schedule` varchar(255) DEFAULT NULL,
  `hours` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `teachers` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `section_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.teacher definition
CREATE TABLE `teacher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mis_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` enum('M','F') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `phone_short` varchar(255) DEFAULT NULL,
  `employee_number` varchar(255) DEFAULT NULL,
  `office_room` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `mis_id` (`mis_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.teacher_info definition
CREATE TABLE `teacher_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `lang` varchar(10) DEFAULT NULL,
  `admin_title` varchar(255) DEFAULT NULL,
  `academic_title` varchar(255) DEFAULT NULL,
  `academic` text DEFAULT NULL,
  `education` text DEFAULT NULL,
  `timetable_name` varchar(255) DEFAULT NULL,
  `timetable_url` varchar(255) DEFAULT NULL,
  `tutor_type` varchar(255) DEFAULT NULL,
  `timetable_file_name` varchar(255) DEFAULT NULL,
  `research_file_url` varchar(255) DEFAULT NULL,
  `research_file_name` varchar(255) DEFAULT NULL,
  `publications_file_url` varchar(255) DEFAULT NULL,
  `publications_file_name` varchar(255) DEFAULT NULL,
  `special_honor` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `teacher_info_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.nav_category definition
CREATE TABLE `nav_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `abbreviation` varchar(255) DEFAULT NULL,
  `dept_website` varchar(255) DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.nav_webaddr definition
CREATE TABLE `nav_webaddr` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `subtitle_en` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `nav_webaddr_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `nav_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.forum_thread definition
CREATE TABLE `forum_thread` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `thread_subject` varchar(255) NOT NULL,
  `thread_text` text DEFAULT NULL,
  `thread_category` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `forum_thread_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- uicinfocenter.forum_reply definition
CREATE TABLE `forum_reply` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `thread_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reply_text` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `thread_id` (`thread_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `forum_reply_ibfk_1` FOREIGN KEY (`thread_id`) REFERENCES `forum_thread` (`id`),
  CONSTRAINT `forum_reply_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 导入部门数据

INSERT INTO uicinfocenter.nav_category (name,name_en,abbreviation,dept_website,cover) VALUES
   ('工商管理学院','Faculty of Business and Management','FBM','https://fbm.uic.edu.cn/',NULL),
   ('人文社科学院','Faculty of Humanities and Social Sciences','FHSS','https://fhss.uic.edu.cn/',NULL),
   ('理工科技学院','Faculty of Science and Technology','FST','https://fst.uic.edu.cn/',NULL),
   ('文化创意学院','School of Culture and Creativity','SCC','https://scc.uic.edu.cn/',NULL),
   ('通识教育学院','School of General Education','SGE','https://sge.uic.edu.cn/',NULL),
   ('研究生院','Graduate School','GS','https://gs.uic.edu.cn/',NULL),
   ('教务处','Academic Registry','AR','https://ar.uic.edu.cn/',NULL),
   ('学生事务处','Student Affairs Office','SAO','https://sao.uic.edu.cn/',NULL),
   ('学习资源中心','Learning Resources Centre','LRC','https://lrc.uic.edu.cn/',NULL),
   ('信息科技服务中心','Information Technology Services Centre','ITSC','https://itsc.uic.edu.cn/',NULL),
   ('医疗及健康教育中心','Medical and Health Education Office','MHEO','https://mheo.uic.edu.cn/',NULL),
   ('招生办','Admission Office','AO','https://admission.uic.edu.cn/',NULL),
   ('物业管理处','Estates Management Office','EMO','https://emo.uic.edu.cn/',NULL),
   ('新闻公关处','Media and Public Relations Office','MPRO','https://mpro.uic.edu.cn/',NULL),
   ('继续教育中心','Academy of Continuing Education','ACE','https://ace.uic.edu.cn/',NULL),
   ('学生职业发展中心','Career Development Centre','CDC','https://career.uic.edu.cn/',NULL),
   ('国际发展处','International Development Office','ID','https://ido.uic.edu.cn/',NULL),
   ('创新中心','Innovation Center','IC','https://ic.uic.edu.cn/',NULL),
   ('拾光文创','Souvernir','Souvernir','NULL',NULL),
   ('校友网','Alumni','Alumni','https://alumni.uic.edu.cn/',NULL),
   ('财务处','Finance Office','FO','https://fo.uic.edu.cn/',NULL),
   ('采购处','Purchasing Office','PO','https://po.uic.edu.cn/',NULL),
   ('教育基金会','Educational Foundation','EF','https://foundation.uic.edu.cn/',NULL),
   ('学校办公室','College Office','CO','https://co.uic.edu.cn/',NULL),
   ('高等研究院','Institute for Advanced Study','IAS','https://ias.uic.edu.cn/',NULL),
   ('数学研究中心','Research Centre for Mathematics','RCM','https://rcm.uic.edu.cn/',NULL),
   ('教师教学发展中心','Center of Teaching and Learning','CTL','https://ctl.uic.edu.cn/',NULL),
   ('北师港浸大团委','Communist Youth League','CYL','NULL',NULL),
   ('党委办公室','CPC','CPC','https://party.uic.edu.cn/',NULL);

-- 创建只读用户
DROP USER IF EXISTS 'uicinfocenter_text2sql'@'%';
CREATE USER 'uicinfocenter_text2sql'@'%' IDENTIFIED BY 'text2sql_password';
GRANT SELECT, REFERENCES ON uicinfocenter.* TO 'uicinfocenter_text2sql'@'%';

FLUSH PRIVILEGES;

-- 创建读写用户
DROP USER IF EXISTS 'uicinfocenter'@'%';
CREATE USER 'uicinfocenter'@'%' IDENTIFIED BY 'backend_password';
GRANT ALL PRIVILEGES ON uicinfocenter.* TO 'uicinfocenter'@'%';

FLUSH PRIVILEGES;