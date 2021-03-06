app.controller('trafficController', ['$scope', '$mdDialog', '$http',  function($scope, $mdDialog, $http){
  console.log('Traffic Controller');
  //---- INITIALIZE VARIABLES
  $scope.weeks = {week1:{num: 1}};
  $scope.totals = {week1:{total: 0}};

  $scope.hours = {
    am2: {fullText:'2a-5a', title:'am2'},
    am5: {fullText:'5a-6a', title:'am5'},
    am6: {fullText:'6a-10a', title:'am6'},
    am10: {fullText:'10a-2p', title:'am10'},
    pm2: {fullText:'2p-6p', title:'pm2'},
    // This hour is removed because it is not scheduled by UWs
    // pm6: {fullText:'6p-7p', title:'pm6'},
    pm7: {fullText:'7p-10p', title:'pm7'},
    pm10: {fullText:'10p-2a', title:'pm10'}
  };
  // This is used to populate the header and scaffold the grid
  $scope.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  $scope.trafficEditRun = false; // default to not editing the Traffic Grid
  $scope.gridUpdated = false; // default success message to not show

  // variables for Invoice PDF
  var invoiceInfo = {};
  $scope.invoice = [];

  //---- DECLARE FUNCTIONS
  $scope.buildFlight = function(){
    console.log('In buildFlight');
    console.log('scope.weeks:', $scope.weeks);

    var numDays = $scope.currentNumWeeks * 7; // seven days in a weeks
    var dayIndex;
    var dayCheck;
    var hourCheck;
    $scope.slotDBinfo = [];
    slotIndex = 0;

    for (var m = 1; m <= numDays; m++) {
      numWeek = Math.ceil(m/7);
      dayIndex = (m-1)-(7*(numWeek-1));
      dayCheck = $scope.days[dayIndex];
      console.log('numWeek:', numWeek);
      for (var hour in $scope.hours) {
        if ($scope.hours.hasOwnProperty(hour)) {
          hourCheck = $scope.hours[hour].fullText;
          if ($scope.weeks['week'+numWeek][hourCheck]){
            if ($scope.weeks['week'+numWeek][hourCheck][dayCheck]) {
              $scope.slotDBinfo[slotIndex] = {
                dayOfRun: m,
                plays: $scope.weeks['week'+numWeek][hourCheck][dayCheck],
                slot: $scope.hours[hour].fullText
              };
              slotIndex++;
            }
          }
        }
      } // end for in loop
    } // end for loop

    console.log('slotDBinfo:', $scope.slotDBinfo);
  }; // end buildFlight()

  $scope.calcFlightTotal = function(){
    console.log($scope.currentNumWeeks);
    $scope.flightTotal = 0;
    for (var l = 1; l <= $scope.currentNumWeeks; l++) {
      $scope.flightTotal = $scope.flightTotal + $scope.totals['week'+l].total;
      console.log('flightTotal:', $scope.flightTotal);
    }
    console.log('totals:',$scope.totals);
  }; // end calcFlightTotal

  $scope.checkInput = function(thisWeek, thisHour, thisDay){
    console.log('in checkInput, with:', thisDay, thisHour, thisWeek);
    var weekName = 'week'+thisWeek;

    if ($scope.weeks[weekName][thisHour][thisDay]<0) {
      $scope.weeks[weekName][thisHour][thisDay]=0;
    } else if ($scope.weeks[weekName][thisHour][thisDay]>20){
      $scope.weeks[weekName][thisHour][thisDay]=20;
    }

    $scope.updateTotals(thisWeek, thisHour, thisDay);
  }; // end checkInput

  $scope.clearFields = function () {
    console.log('in clearFields');
    $scope.weeks = {week1:{num: 1}};
    $scope.totals = {week1:{total: 0}};
    $scope.flightTotal = 0;

    $scope.trafficEditRun = false;
    $scope.flightInfoExists = false;
  }; // end clearFields

  $scope.enableGridEdit = function () {
    $scope.trafficEditRun = true;
  };

  $scope.getCartNum = function () {
    console.log('in getCartNum');
    $http({
      method: 'GET',
      // whatever url Luis uses
      url: '/traffic/cart_number?q=' + $scope.currentContractId,
    }).then(function (response){
      $scope.cart_number = response.data[0].cart_number;
      console.log('$scope.cart_number = ', $scope.cart_number);
    }, function (error) {
      console.log('error in cart_number get;', error);
    }); // end then function
  }; // end getCartNum

  $scope.getInvoice = function(){
    console.log("In the PDF click");
    console.log("invoice info:", invoiceInfo);
    var docDefinition =

    {

      pageSize: 'A5',
      pageSize: 'FOLIO',
      pageOrientation: 'landscape',
      content: [
          {image: 'data:image/jpeg;base64,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',
          width: 40,
          height: 40,
          alignment: 'center'
        },
        {text: 'KMOJ TENTATIVE RUN SCHEDULE\n', alignment: 'center', style: 'header'},
        {text: 'Order ID: 4328', alignment: 'center'},
        ['\n\n'],
        {text: '2123 W. Broadway, Suite 200', alignment: 'left'},
        {text: 'Minneapolis, MN 55411', alignment: 'left'},
        {text: 'Phone: (612)377-0594', alignment: 'left'},
        {text: 'Fax: (612)377-6919\n\n', alignment: 'left'},


        {
          table: {
            body: [
              ['Sponsor: ', '' + invoiceInfo.clients_name],
              ['Event:', '' + invoiceInfo.event_name],
              ['Underwriter:', '' + invoiceInfo.uw_name],
              ['Run Dates:', '' + invoiceInfo.start_date + invoiceInfo.end_date],
              ['Total Spots:', '' + invoiceInfo.total_spots],
              ['Total Cost:', '' + invoiceInfo.total_cost],
              ['Discounts', '' + invoiceInfo.discounts],
              ['Commission', '' + invoiceInfo.commission]
            ]

          }

        }, //end table
        ['\n'],
        {text: 'Scheduled Station: KMOJ', style: 'subheader', alignment: 'center'},
        {text: '' + invoiceInfo.clients_name + '\n\n\n', alignment: 'center'},


        {
          table: { alignment: 'center',
          body: [
            ['Run Dates', 'Run Times', 'Day of Run', 'Total Spots', 'Length', 'CopyID', 'Rate', 'Total'],
            ['' + invoiceInfo.start_date + invoiceInfo.end_date, '' + invoiceInfo.slot, '' + invoiceInfo.day_of_run, '' + invoiceInfo.total_spots, '' + invoiceInfo.spot_length, '' + invoiceInfo.copy_id, '' + invoiceInfo.spot_rate, '' + invoiceInfo.total_cost + '\n\n\n']
            ]
          }
        },
        ['\n\n'],
        {

          text: 'Confirmed Correct:________________________       Accepted for KMOJ:________________________ ', alignment: 'center'
        },
      ]// end content

    };// end docDefinition
    pdfMake.createPdf(docDefinition).open();
  }; // end getInvoice

  $scope.getInvoiceInfo = function (){
    $http({
      method: 'GET',
      url: '/traffic/invoice'
    }).then(function(response){
      console.log('response is ', response);
      $scope.invoices = response.data;
      console.log('$scope.invoice is', $scope.invoice);
      console.log('response.data is ', response.data);
      invoiceInfo.event_name = response.data[0].event_name;
      invoiceInfo.users_name = response.data[0].users_name;
      invoiceInfo.total_spots = response.data[0].total_spots;
      invoiceInfo.total_cost = response.data[0].total_cost;
      invoiceInfo.discounts = response.data[0].discounts;
      invoiceInfo.commission = response.data[0].commission;
      invoiceInfo.start_date = response.data[0].start_date;
      invoiceInfo.end_date = response.data[0].end_date;
      invoiceInfo.spot_length = response.data[0].spot_length;
      invoiceInfo.spot_type = response.data[0].spot_type;
      invoiceInfo.spot_rate = response.data[0].spot_rate;
      invoiceInfo.copy_id = response.data[0].copy_id;
      invoiceInfo.slot = response.data[0].slot;
      invoiceInfo.day_of_run = response.data[0].day_of_run;
      invoiceInfo.clients_name = response.data[0].clients_name;
      console.log('$scope.invoice is ', $scope.invoice);
      console.log('invoice info================:', invoiceInfo);
    }, function errorCallback (response){
      console.log('error getting invoices', response);
    });
  }; // end getInvoiceInfo

  $scope.getPendingContracts = function () {
    console.log('in getPendingContracts');
    $http({
      method: 'GET',
      url: '/traffic/contractsPending',
    }).then(function(response){
      $scope.pendingContracts = response.data;
      $scope.flightInfoExists = false;
      console.log('$scope.pendingContracts', $scope.pendingContracts);
    }, function errorCallback (response){
      console.log('err', response);
    }); // end then
  }; // end getPendingContracts

  $scope.selectContractFlight = function (contract_id, event_name) {
    console.log('in selectContractFlight');
    console.log('contract_id = ' + contract_id);
    $scope.gridUpdated = false;
    $scope.currentContractId = contract_id;
    $scope.currentEventName = event_name;

    $http({
      method: 'GET',
      url: '/traffic/flightContract?q=' + contract_id,
    }).then(function(response){
      $scope.flightInfo = response.data;
      console.log('flight info:', $scope.flightInfo);
      $scope.start_date = moment($scope.flightInfo[0].start_date).format('ddd, MMM DD YYYY');
      $scope.end_date = moment($scope.flightInfo[0].end_date).format('ddd, MMM DD YYYY');
      $scope.cart_number = $scope.flightInfo[0].cart_number;
      $scope.flightInfoExists = true;
      var thisWeek;
      var thisSlot;
      var thisDay;
      var flightLastIndex = $scope.flightInfo.length-1;
      var flightLastDay = $scope.flightInfo[flightLastIndex].day_of_run;
      $scope.numWeeks = Math.ceil(flightLastDay/7);
      $scope.currentNumWeeks = $scope.numWeeks;
      $scope.weeks = {};
      $scope.totals = {};
      $scope.flightTotal = 0;
      for (var i = 1; i <= $scope.numWeeks; i++) {
        thisWeek = 'week'+i;
        $scope.weeks[thisWeek]= {};
        $scope.totals[thisWeek]= {};
        $scope.weeks[thisWeek].num = i;
        $scope.totals[thisWeek].total = 0;
      }

      console.log('Organizing Run info:');
      for (var j = 0; j < $scope.flightInfo.length; j++) {
        var dayOfRun = $scope.flightInfo[j].day_of_run;
        var weekNum = Math.ceil(dayOfRun/7);
        thisWeek = 'week'+weekNum;
        // -((weekNum-1)*7) adjusts the dayOfRun to the correct day of the week
        // -1 adjust for the index in the $scope.days array
        thisDay = $scope.days[dayOfRun-((weekNum-1)*7)-1];
        thisSlot = $scope.flightInfo[j].slot;

        console.log('Day:',$scope.flightInfo[j].day_of_run,'- Week:',thisWeek,
        '- Plays:', $scope.flightInfo[j].plays);
        if (!$scope.weeks[thisWeek][thisSlot]) {
          $scope.weeks[thisWeek][thisSlot] = {};
          $scope.totals[thisWeek][thisSlot] = 0;
        }
        $scope.weeks[thisWeek][thisSlot][thisDay] = $scope.flightInfo[j].plays;
        $scope.totals[thisWeek][thisSlot] += $scope.flightInfo[j].plays;
        $scope.totals[thisWeek].total += $scope.flightInfo[j].plays;
        $scope.flightTotal += $scope.flightInfo[j].plays;
      }
      console.log('$scope.weeks',$scope.weeks);
      // console.log(response);
    }, function errorCallback (response){
      console.log('err', response);
    }); // end then
  }; // end selectContractFlight

  $scope.submitGridUpdate = function (ev){
    console.log('in submitGridUpdate');
    // These lines will build the "required fields" message
    // Initialize the message string
    var requiredFields = 'The following fields are required or have errors:';
    // Check the totals for an empty week
    var emptyWeek = false; // set flag to false
    for (var week in $scope.totals) {
      if ($scope.totals.hasOwnProperty(week)) {
        if ( $scope.totals[week].total === 0 ) { // if any week has a total of Zero
          emptyWeek = true; // change flag to true
        }
      }
    }
    $scope.buildFlight(); // go get the information recorded in the Traffic Grid
    if ($scope.slotDBinfo.length === 0 || emptyWeek) { // if there is an empty week
      requiredFields += ' - Traffic Flight Grid'; // add it to the error message
    }

    console.log('userData:', $scope.userData);
    console.log(requiredFields);
    // check error message to see if anything has been added
    if (requiredFields !== 'The following fields are required or have errors:'){
      console.log('Missing Required Field or other error found!');
      // if so, then show the NG-materials error message
      $scope.showAlert = function(ev) {
        $mdDialog.show(
          $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Error in Required Field(s)!')
          .textContent(requiredFields)
          .ariaLabel('Required Field Alert')
          .ok('Understood')
          .targetEvent(ev)
        );
      };
      $scope.showAlert();
    } else {
      console.log();
      var gridToSend = {
        slotInfo: $scope.slotDBinfo,
        contract_id: $scope.currentContractId
      };

      console.log('Traffic gridToSend:', gridToSend);

      $http({
        method: 'POST',
        url: '/traffic/slots',
        data: gridToSend
      }).then(function (response){
        console.log('Received Success!!!');
        $scope.clearFields();
        $scope.gridUpdated = true;
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      }, function (error) {
        console.log('error in uwCtrl client post route:', error);

      }); // end then function

        }//end else
  }; // end submitGridUpdate

  $scope.trafficApproval = function (contract_id) {
    console.log('in trafficApproval');
    console.log('contract_id = ', contract_id);
    $http({
      method: 'PUT',
      url: '/traffic/approval?q=' + contract_id,
    }).then($scope.getPendingContracts);
  }; // end trafficApproval

  $scope.trimWeeks = function(removeStart, currentMaxWeek, thisWeek, emptyOfInfo){
    for (var j = removeStart; j <= currentMaxWeek; j++) {
      thisWeek = 'week'+j;
      delete $scope.weeks[thisWeek];
      delete $scope.totals[thisWeek];
      $scope.currentNumWeeks--;
    }
    // if it was not empty of info then we need to recalculate the totals
    if (!emptyOfInfo){
      //// Update the flight's total
      $scope.calcFlightTotal();
    }
  }; // end trimWeeks

  $scope.updateCartNum = function (cart_number) {
    console.log('Current Contract Id:', $scope.currentContractId);
    console.log('in updateCartNum', cart_number);
    $http({
      method: 'PUT',
      url: '/traffic/cart_number?q=' + $scope.currentContractId,
      data: cart_number
    }).then($scope.getCartNum);
  }; // end updateCartNum

  $scope.updateTotals = function(thisWeek, thisHour, thisDay){
    console.log('in updateTotals, with:', thisDay, thisHour, thisWeek);
    var weekName = 'week'+thisWeek;
    // Reset counters
    $scope.totals[weekName][thisHour] = 0;
    $scope.totals[weekName].total = 0;
    console.log('totals:', $scope.totals[weekName].total);
    var dayCheck;
    // check to see if anything has been recorded yet
    for (var k = 0; k < $scope.days.length; k++) {
      dayCheck = $scope.days[k];
      //// Update the hour's total
      // if there is a total for that day then add it to the sum
      if ($scope.weeks[weekName][thisHour][dayCheck]) {
        $scope.totals[weekName][thisHour] =
        $scope.totals[weekName][thisHour] +
        $scope.weeks[weekName][thisHour][dayCheck];
      }
      //// Update the week's total
      for (var hour in $scope.hours) {
        if ($scope.hours.hasOwnProperty(hour)) {
          var hourCheck = $scope.hours[hour].fullText;
          if ($scope.weeks[weekName][hourCheck] && $scope.weeks[weekName][hourCheck][dayCheck]) {
            $scope.totals[weekName].total =
            $scope.totals[weekName].total +
            $scope.weeks[weekName][hourCheck][dayCheck];
            console.log('playsToAdd:', $scope.weeks[weekName][hourCheck][dayCheck]);
            console.log('totals:', $scope.totals[weekName].total);
          }
        }
      }  // End for loop throuh hours in day
    } // End for loop through days of week

    //// Update the flight's total
    $scope.calcFlightTotal();
  }; // end updateTotals

  $scope.updateWeeks = function(weekRequest, ev){
    console.log('in updateWeeks with:', weekRequest);

    var currentMaxWeek = $scope.currentNumWeeks;
    // Disallow negative or 0 week requests
    if (weekRequest <= 0) {
      weekRequest = currentMaxWeek;
    }
    console.log('currentMaxWeek:', currentMaxWeek);
    var weeksDiff = weekRequest - currentMaxWeek;
    console.log('weeksDiff:', weeksDiff);
    if (weeksDiff > 0){
      var nextWeekNum = currentMaxWeek+1;
      var newTotalWeeks = currentMaxWeek+weeksDiff;
      var weekToAdd;
      for (var i = nextWeekNum; i <= newTotalWeeks; i++) {
        weekToAdd = 'week'+i;
        $scope.weeks[weekToAdd]={num: i};
        $scope.totals[weekToAdd]={total: 0};
        $scope.currentNumWeeks++;
      } // end for loop
    } else if (weeksDiff < 0) {
      // make weeksDiff positive to be usable in various ways
      weeksDiff = -weeksDiff;
      var newMaxWeek = currentMaxWeek-weeksDiff;
      var emptyOfInfo = true;
      var searchDone = false;
      var removeStart = newMaxWeek+1;
      var weekInQuestion = removeStart;
      var thisWeek;
      // Check to see if any information has been entered in the weeks that are
      // about to be deleted
      while (emptyOfInfo && !searchDone) {
        thisWeek = 'week'+weekInQuestion;
        // check for any hours in the week object
        for (var hour in $scope.weeks[thisWeek]) {
          if ($scope.weeks[thisWeek].hasOwnProperty(hour)) {
            // check for any days in the hour object
            for (var day in $scope.weeks[thisWeek][hour]) {
              if ($scope.weeks[thisWeek][hour].hasOwnProperty(day)) {
                // if the value there is not equal to zero
                if($scope.weeks[thisWeek][hour][day] !== 0) {
                  // then we have info to lose!
                  emptyOfInfo = false;
                } // end zero check
              }
            } // end loop through days
          }
        } // end loop through hours
        weekInQuestion++;
        if (weekInQuestion>currentMaxWeek) {
          searchDone = true;
        }
      }
      // if the weeks in question are not empty of information
      if (!emptyOfInfo) {
        // then confirm the action with the user
        var pluralText = 's';

        if(weeksDiff===1){
          pluralText = '';
        }

        var confirm = $mdDialog.confirm()
        .title('Remove '+weeksDiff+' week'+pluralText+' - Are you sure?')
        .textContent('You have entered information in the '+weeksDiff+' week'+pluralText+' you are about to remove.')
        .ariaLabel('Removal Warning')
        .targetEvent(ev)
        .ok('Remove extra week'+pluralText)
        .cancel('Cancel and review');

        $mdDialog.show(confirm).then(function() {
          console.log('You chose True!');
          $scope.trimWeeks(removeStart, currentMaxWeek, thisWeek, emptyOfInfo);
        }, function() {
          console.log('You chose False!');
        });
      } else {
        // else the week are empty of information and we can remove them
        $scope.trimWeeks(removeStart, currentMaxWeek, thisWeek, emptyOfInfo);
      }
    } // end weeksDiff check (if-else)
  }; // end updateWeeks



  // ---- RUN ON PAGE LOAD
  $scope.getPendingContracts();

}]); // end trafficController
