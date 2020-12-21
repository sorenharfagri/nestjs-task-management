import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UsePipes, ValidationPipe, ParseIntPipe, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user/user.entity';
import { GetUser } from '../auth/user/get-user.decorator';


/* 
  Доступ к таскам осуществляется только при наличи jwt токена
  С помощью которого метод validate находит пользователя и вшивает его в запрос

  Таким образом каждый метод контроллера может получить доступ к пользователю, который производит запрос
  С помощью декоратора GetUser
*/
@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');

  constructor(private tasksService: TasksService) {}

  /*
    Получение массива тасков пользователя

    В Query могут быть переданы фильтры, согласно filterDto
    Которые будут применены к поиску в бд
        
    К примеру может быть передан параметр status=IN_PROGRESS
    С помощью которого метод вернёт все таски который находятся в процессе выполнения

    В случае если фильтры не переданы - вернутся все таски пользователя
  */

  @Get()
  getTasks(
    @Query(ValidationPipe) filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(`User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`);
    return this.tasksService.getTasks(filterDto, user);
  }

  /*
    Получение определённого таска пользователя по id
  */

  @Get('/:id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  /* 
    Создание нового таска
    В случае успешного создание возвращается созданный таск
  */

  @Post()
  @UsePipes(ValidationPipe)
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(`User "${user.username}" creating a new task. Data: ${JSON.stringify(createTaskDto)}`);
    return this.tasksService.createTask(createTaskDto, user);
  }

  /*
    Удаление таска по id
    В случае ненахода возврващается NotFoundException
  */

  @Delete('/:id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  /*
    Обновление статуса таска по id
    В случае успешного обновления вовращается обновлённый таск
  */

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
