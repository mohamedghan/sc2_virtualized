CREATE TABLE `containers` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` integer,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `users`;