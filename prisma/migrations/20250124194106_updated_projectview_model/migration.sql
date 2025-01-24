/*
  Warnings:

  - A unique constraint covering the columns `[project_id,time_interval,start_time]` on the table `project_view` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "project_view_project_id_time_interval_start_time_key" ON "project_view"("project_id", "time_interval", "start_time");
