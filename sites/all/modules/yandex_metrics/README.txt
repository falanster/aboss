------------------------------------------------------------------------------
                            YANDEX.METRICS MODULE
------------------------------------------------------------------------------
Note: Russian version of this documentation see below.

The Yandex.Metrics [1] service is European alternative of Google Analytics.

The Yandex.Metrics module gets analytic information from Yandex.Metrics service and
displays it on your site in convenient ways.

The Yandex.Metrics API [2] is used for communication with Yandex.Metrics service.

Features:
    * Installing Yandex.Metrics counter code on your site (visibility settings for pages and user roles)
    * Authorizing of your site on Yandex services (through oAuth 2.0)
    * Reports and charts:
        * Page Views, Visitors, New Visitors
        * Traffic Sources
        * Popular Search Phrases
        * Popular Content
        * Geography of Visits
    * Block with popular content links (updating through Cron)

Module dependencies
    * Google chart API [3]
    * [Optional] For support of internationalized domain names 
      download idna_convert class of Matthias Sommerfeld from [10] and copy it
      into the 'sites/all/libraries/idna_convert/' or 'sites/name_of_your_site/libraries/idna_convert/'
      folder of your Drupal setup.

Available interface translations
Russian (Русский)



INSTALLING
------------------------------------------------------------------------------
1. Backup your database.

2. Make sure you resolved dependencies of the module. 
   Please install Google chart API [3] module first.

3. If you use internationalized domain name you should download PHP file idna_convert.class.php
   of Matthias Sommerfeld from [10] and copy it into the 'sites/all/libraries/idna_convert/' or
   'sites/name_of_your_site/libraries/idna_convert/' folder of your Drupal setup.

4. Copy the complete 'yandex_metrics/' directory into the 'sites/all/modules/',
   'sites/default/modules' or 'sites/name_of_your_site/modules' folder of 
   your Drupal setup. 
   More information about installing contributed modules could be found at 
   "Install contributed modules" (http://drupal.org/node/70151)

5. Enable the "Yandex.Metrics" module from the module administration page
   (Administration >> Modules).

6. Configure the module (see "CONFIGURATION" below).



UPDATING
------------------------------------------------------------------------------
1. Verify that the version you are going to upgrade contains all the features
   you are using in your Drupal setup. Some features could have been removed
   or replaced by others.

2. Read carefully in the project issue tracking about upgrade paths problems
   before you start the upgrade process. 

3. Backup your database.

4. Update current module code with latest recommended version. Previous versions 
	could have bugs already reported and fixed in the last version.

5. Complete the update process, set maintenance mode, call the update.php script 
	and finish the update operation. 
	For more information please go to: http://groups.drupal.org/node/19513

6. Verify your module configuration and check that the features you are using
   work as expected. Also verify that all required modules are enabled, and
   permissions are set as desired.

Note: whenever you have the chance, try an update in a local or development
      copy of your site.


CONFIGURATION
------------------------------------------------------------------------------
1. On the access control administration page ("Administration >> People
   >> Permissions") you need to assign:

*	"Administer Yandex.Metrics settings" permission to the roles that are allowed 
	to administer the Yandex.Metrics settings.
*   "Access Yandex.Metrics report" permission to the roles that are allowed
    to view Yandex.Metrics Summary Report

2. Create Yandex.Metrics [1] account.

   Please skip this step if you have already had it.

3. Create Yandex.Metrics counter for your site at Yandex.Metrics admin interface. 
   And generate counter Javascript code there. 
   Note: We recommend to create simple counter without any widget 
         but counter code with widget is acceptable.
   
   Save this Javascript code for later usage.
   
   Please skip this step if you have already created a counter.

4. Go to the module settings page ("Administration >> Configuration >> System >> Yandex.Metrics")
   There are three tabs: Counter Code, Authorization and Reports. To access any of these tabs users need
   the "administer Yandex.Metrics settings" permission.

   Paste Javascript code of counter from Yandex.Metrics to the Counter Code text field
   on the module settings page ("Administration >> Configuration >> System >> Yandex.Metrics").
   You can also define counter code visibility settings.
   Then submit form.
   By this step you add counter code to the footer of permitted pages of your site.
   
   Please skip this step if you have already added Yandex.Metrics counter code on your site pages 
   through another way.

   Please skip next steps if you need nothing except installation of counter code.

5. Register your Yandex application. Use Yandex step-by-step guide [6]
   to perform this step.

   Enter Callback URI for your Yandex application.
   Callback URI: http://YOUR_SITE_HOST_NAME/yandex_metrics/oauth

   Save your application Client ID and Client Secret for later usage.

6. Application authorization. 
   Go to Authorization tab and paste application Client ID and Client Secret into the corresponding fields.
   Then press Authorise Application button to submit form.
   
   You will be redirected to the special Yandex page. 
   You should confirm your application authorization on that page.
   Enter your Yandex login and password if it will be necessary.
   
   Then your will be redirected back to the settings page of the Yandex.Metrics module on your site 
   and get success message.

7. Reports settings
   Go to Reports tab.
   Here you can to turn on AJAX for reports.
   It can reduce loading time of Summary Report page.

   Also you can enable/disable displaying of reports.

8. Check Yandex.Metrics Summary Report content
   ("Administration >> Reports >> Yandex.Metrics Summary Report").
   To access this page users need the "access Yandex.Metrics report" permission.
   Note:
     Your report can be empty if you have just created Yandex.Metrics counter 
     and placed it to your site. Probably statistic information have not been collected yet.
     Please try again later.

9. After module installing and configuration, there's gonna be accessible "Popular content" block.
   This block shows popular content pulled from Yandex as a list of links.

   The block has two configuration options: the Filter date period and the Count of links. 
   These options are accessible at block configuration page("Administer >> Blocks >> Popular content").
   The Filter date period option configures the period of time that you want to filter popular 
   content(Today, Yesterday, Week or Month).
   The Count of links option allows you to select how many links to show in the 
   block(5, 10 or 15 links).

   Note:
     Block caches the popular content data, that's done to prevent excessive requests to Yandex. 
     In order to clear the cache you should change the Filter date period and after that save the 
     block. Also, it tries to pull and save popular content in cache when the block is showing 
     for the first time.

   Attention:
     To maintain data in the block up-to-date, you should configure CRON [9].
	 
	 

BUGS AND SHORTCOMINGS
------------------------------------------------------------------------------
* See the list of project issues [7].


AUTHORS AND MAINTAINERS
------------------------------------------------------------------------------
Idea: Alex Sorokin [4]
Maintainer: Konstantin Komelin [5]
Previous co-maintainers: Alex Sorokin [4], Alexey Tataurov [8]


LINKS
------------------------------------------------------------------------------
[1] http://metrika.yandex.ru/
[2] http://api.yandex.ru/metrika/
[3] http://drupal.org/project/chart
[4] http://drupal.org/user/108088
[5] http://drupal.org/user/1195752
[6] http://api.yandex.ru/oauth/doc/dg/tasks/register-client.xml
[7] http://drupal.org/project/issues/yandex_metrics
[8] http://drupal.org/user/957718
[9] http://drupal.org/cron
[10] http://www.phpclasses.org/browse/file/5845.html


------------------------------------------------------------------------------
                            Модуль Yandex.Metrics
------------------------------------------------------------------------------


Сервис Яндекс.Метрика [1] - это Европейская альтернатива Google Analytics.

Модуль Yandex.Metrics получает аналитическую информацию с сервиса Яндекс.Метрика
и отображает ее в удобном виде на вашем сайте.

Для взаимодействия с сервисом Яндекс.Метрика используется API Яндекс.Метрики [2].

Возможности:
    * Установка кода счетчика на сайт (настройка видимости для страниц и ролей пользователей)
	* Авторизация сайта на сервисах Яндекса (используя oAuth 2.0)
	* Отчеты и графики:
        * Просмотры страниц, посетители, новые посетители
        * Источники переходов
        * Популярные поисковые фразы
        * Популярное содержимое
        * География посещений
    * Блок со ссылками на популярный контент (обновление по Cron)

Зависимости модуля
    * Google chart API [3]
    * [Необязательно] Для поддержки интернационализированных доменных имен
      скачайте класс idna_convert, разработанный Matthias Sommerfeld, отсюда [10] и скопируйте его
      в 'sites/all/libraries/idna_convert/' или 'sites/name_of_your_site/libraries/idna_convert/'
      директорию установленного Drupal.

Доступные переводы интерфейса
Русский



УСТАНОВКА
------------------------------------------------------------------------------
1. Создайте резервную копию вашей базы данных.

2. Убедитесь, что зависимости модуля разрешены.
   Пожалуйста, сначала установите модуль Google chart API [3].

3. Если вы используете интернационализированное доменное имя, вам следует скачать PHP файл
   idna_convert.class.php, созданный Matthias Sommerfeld, со страницы [10] и скопировать его
   в 'sites/all/libraries/idna_convert/' или 'sites/name_of_your_site/libraries/idna_convert/'
   директорию вашей Drupal установки.

4. Скопируйте директорию 'yandex_metrics/' целиком в 'sites/all/modules/' или
   'sites/default/modules' или 'sites/имя_вашего_сайта/modules' директорию
   вашей Drupal установки.
   Больше информации об установке модулей вы можете найти в 
   "Install contributed modules" (http://drupal.org/node/70151)

5. Включите модуль "Yandex.Metrics" на странице управления модулями
   (Управление >> Модули).

6. Настройте модуль (смотрите раздел "НАСТРОЙКА" ниже).



ОБНОВЛЕНИЕ
------------------------------------------------------------------------------
1. Убедитесь в том, что версия, до которой вы хотите обновиться, содержит все
   возможности, которые вы используете в вашей Drupal установке. 
   Некоторые возможности могли быть удалены или заменены другими.

2. Внимательно изучите очередь задач проекта на наличие возможных проблем при
   обновлении до начала процесса обновления.

3. Создайте резервную копию вашей базы данных.

4. Обновите текущий код модуля на последнюю рекомендуемую версию. Предыдущая
   версия могла иметь ошибки уже известные и исправленные в последней версии.

5. Завершите процесс обновления. Для этого установите режим обслуживания на сайте,
   вызовите скрипт update.php и завершите операцию обновления.
   Для получения дополнительной информации, пожалуйста, следуйте в 
   http://groups.drupal.org/node/19513.

6. Проверьте настройки вашего модуля и то, что модуль работает корректно.
   Также убедитесь, что все требуемые модули включены и разрешения ролей назначены. 

Замечание: если вы имеете такую возможность, постарайтесь обновить модуль сначала
           на локальной или тестовой копии вашего сайта.


НАСТРОЙКА
------------------------------------------------------------------------------
1. На странице управления разрешениями ролей ("Управление >> Люди
   >> Разрешения") вам нужно назначить:

*	"Управлять Yandex.Metrics настройками" разрешение ролям, которым вы хотите позволить 
	управлять настройками Yandex.Metrics модуля.
*   "Доступ к Yandex.Metrics отчету" разрешение ролям, которым вы хотите разрешить
    просматривать Сводный отчет Yandex.Metrics

2. Создайте учетную запись на Яндекс.Метрике [1].

   Пропустите этот шаг, если вы уже ее имеете.

3. Создайте счетчик Яндекс.Метрики для вашего сайта в личном кабинете Яндекс.Метрики.
   Там же создайте Javascript код счетчика.
   Замечание: Мы рекомендуем создать простой счетчик без информера, 
              но счетчик с информером так же допускается.
   
   Сохраните сформированный Javascript код для того, чтобы использовать его далее.
   
   Пропустите этот шаг, если вы уже создали счетчик для вашего сайта.
   
4. Перейдите на страницу настройки модуля ("Управление >> Настройка >> Система >> Yandex.Metrics")
   На странице настроек есть три вкладки: Код счетчика, Авторизация и Отчеты. Для доступа к любой из этих
   вкладок пользователи нуждаются в разрешении "управлять Yandex.Metrics настройками".
   
   Вставьте Javascript код счетчика из Яндекс.Метрики в текстовое поле Код счетчика на странице 
   настройки модуля ("Управление >> Настройка >> Система >> Yandex.Metrics").
   Вы также можете произвести настройку отображения кода счетчика.
   Затем отправьте форму.
   Этим шагом вы добавите код счетчика в подвал разрешенных страниц вашего сайта.
   
   Пропустите этот шаг, если вы уже добавили код счетчика Яндекс.Метрики на страницы вашего сайта 
   любым другим способом.

   Пропустите следующие шаги, если вас не интересует ничего, кроме установки счетчика.

5. Зарегистрируйте Яндекс приложение. Используйте пошаговую инструкцию от Яндекс [6]
   для выполнения этого шага.

   Введите Callback URI для вашего Яндекс приложения.
   Callback URI: http://ИМЯ_ВАШЕГО_САЙТА/yandex_metrics/oauth

   Сохраните Id приложения и Пароль приложения для того, чтобы использовать его далее.
   
6. Авторизация приложения.
   Перейдите на вкладку Авторизация и вставьте Id приложения и Пароль приложения в соответствующие поля.
   Затем нажмите кнопку Авторизовать приложение для того чтобы отправить форму.
   
   Вы будете перенаправлены на специальную страницу Яндекса.
   Вам следует подтвердить авторизацию на этой странице.
   Введите имя пользователя и пароль на Яндексе, если потребуется.
   
   После этого вы будете перенаправлены обратно на страницу настройки модуля Yandex.Metrics 
   на вашем сайте и увидите уведомление об успешной авторизации.

7. Настройка отчетов
   Перейдите на вкладку Отчеты.
   Здесь вы можете включить AJAX для отчетов.
   Это может уменьшить время загрузки Сводного отчета Yandex.Metrics.

   Кроме того здесь можно включить или выключить отображение того или иного отчета.

8. Проверьте содержимое Сводного отчета Yandex.Metrics
   ("Управление >> Отчеты >> Сводный отчет Yandex.Metrics").
   Для доступа к этой странице пользователи нуждаются в разрешении "доступ к Yandex.Metrics отчету".
   Замечание:
     Ваш отчет может быть пуст, если вы только что создали счетчик Яндекс.Метрики и разместили
     его на ваш сайт. Вероятно статистическая информация еще не была собрана.
     Пожалуйста, попробуйте позже.

9. После установки и настройки модуля вам будет доступен блок "Популярное содержимое".
   Этот блок показывает список ссылок популярного контента предоставляемого Яндексом.
   
   Для настройки блока доступны две опции: Фильтр по дате и Количество ссылок для показа.
   Эти опции находятся на странице настройки блока("Управление >> Блоки >> Популярное содержимое").
   Опция "Фильтр по дате" позволяет выбрать промежуток времени по которому будет выбираться 
   популярный контент(Сегодня, Вчера, Текущая неделя или Текущий месяц).
   Опция "Количество ссылок" предоставляет возможность указать количество ссылок, которое
   будет показываться в блоке(5, 10 или 15 ссылок).

   Замечание:
     Для того чтобы не посылать лишнее количество запросов к Яндексу, блок использует 
     механизм кеширования результатов. Очистить кеш можно при изменении текущего значения опции 
     "Фильтр по дате" и затем сохранив новые настройки блока. Кроме этого, блок попытается 
     выполнить запрос популярного контента и сохранить результаты в кеш при первом показе блока.

   Внимание:
     Для поддержания данных в блоке в актуальном состоянии вам следует настроить CRON [9].
	 
	 

ОШИБКИ И НЕДОСТАТКИ
------------------------------------------------------------------------------
* Смотрите полный список задач [7].


АВТОРЫ И РАЗРАБОТЧИКИ
------------------------------------------------------------------------------
Идея: Александр Сорокин [4]
Разработчик: Константин Комелин [5]
Участвовали в разработке: Александр Сорокин [4], Алексей Татауров [8]


ССЫЛКИ
------------------------------------------------------------------------------
[1] http://metrika.yandex.ru/
[2] http://api.yandex.ru/metrika/
[3] http://drupal.org/project/chart
[4] http://drupal.org/user/108088
[5] http://drupal.org/user/1195752
[6] http://api.yandex.ru/oauth/doc/dg/tasks/register-client.xml
[7] http://drupal.org/project/issues/yandex_metrics
[8] http://drupal.org/user/957718
[9] http://drupal.org/cron
[10] http://www.phpclasses.org/browse/file/5845.html