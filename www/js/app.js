// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

    .run(function ($ionicPlatform) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })
    .config(function ($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('accounts', {
            url: '/accounts',
            templateUrl: 'templates/accounts.html',
            controller: 'AccountsCtrl'
          })
          .state('hosts', {
            url: '/:account/hosts',
            templateUrl: 'templates/hosts.html',
            controller: 'HostsCtrl'
          })
          .state('logs', {
            url: '/:account/hosts/:host',
            templateUrl: 'templates/logs.html',
            controller: 'LogsCtrl'
          })
          .state('logentries', {
            url: '/:account/hosts/:host/:log',
            templateUrl: 'templates/logentries.html',
            controller: 'LogentriesCtrl'
          });

      $urlRouterProvider.otherwise('/accounts');
    })

    .controller('AccountsCtrl', function ($scope, $ionicPopup, $window) {
      function readAccounts() {
        return $scope.accounts = angular.fromJson($window.localStorage.getItem('accounts') || '[]');
      }

      readAccounts();

      function addAccount(account) {
        var accounts = readAccounts();
        accounts.push(account);
        $window.localStorage.setItem('accounts', angular.toJson(accounts));
      }

      $scope.addAccount = function () {
        if (navigator.notification && navigator.notification.prompt) {
          navigator.notification.prompt('Insert your account key',
              function (result) {
                if (result.input1 && result.input1.length) {
                  addAccount(result.input1);
                }
              }, 'Add account');
        } else {
          $ionicPopup.prompt({
            title: 'Add account',
            template: 'Insert you account key'
          }).then(function (account) {
            if (account) {
              addAccount(account);
            }
          });
        }
      };

      $scope.removeAccount = function (account, e) {
        var accounts = readAccounts();

        accounts.splice(accounts.indexOf(account), 1);

        $window.localStorage.setItem('accounts', angular.toJson(accounts));

        readAccounts();
        e.stopPropagation();
      };
    })
    .controller('HostsCtrl', function ($stateParams, $scope, $http, BaseUrl) {
      $scope.account = $stateParams.account;

      $http.get(BaseUrl + $scope.account + '/hosts')
          .success(function (account) {
            $scope.hosts = account.list;
          });
    })
    .controller('LogsCtrl', function ($scope, $stateParams, $http, BaseUrl) {
      $scope.account = $stateParams.account;
      $scope.host = $stateParams.host;

      $http.get(BaseUrl + $scope.account + '/hosts/' + $scope.host + '/')
          .success(function (host) {
            $scope.logs = host.list;
          });
    })
    .controller('LogentriesCtrl',
    function ($scope, $stateParams, $http, BaseUrl, $interval, $ionicScrollDelegate) {
      var intervalToken;

      $scope.account = $stateParams.account;
      $scope.host = $stateParams.host;
      $scope.log = $stateParams.log;

      $scope.entries = [];
      $scope.start = Date.now() - 60 * 1000;

      function refreshLogs() {
        $scope.end = Date.now();

        $http.get(BaseUrl + $scope.account + '/hosts/' + $scope.host + '/' + $scope.log + '/' +
        '?limit=2000&start=' + $scope.start + '&end=' + $scope.end)
            .success(function (logentries) {
              Array.prototype.push.apply($scope.entries,
                  logentries.split('\n').filter(function (entry) {
                    return entry.length;
                  }));

              $scope.start = $scope.end;
              $ionicScrollDelegate.scrollBottom(true);
            });
      }

      $scope.$on('$destroy', function() {
        intervalToken && $interval.cancel(intervalToken);
      });

      intervalToken = $interval(refreshLogs, 5000);

      refreshLogs();
    })

    .value('BaseUrl', 'http://cors.maxogden.com/https://pull.logentries.com/');
