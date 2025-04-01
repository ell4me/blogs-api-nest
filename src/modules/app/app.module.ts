import { DynamicModule, Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {
  static async forRoot(): Promise<DynamicModule> {
    // Такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // Чтобы не обращаться в декораторе(@Module) к переменной окружения через process.env, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
    const additionalModules: any[] = [];

    return {
      module: AppModule,
      imports: additionalModules, // Add dynamic modules here
    };
  }
}
