
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajTri(stPacienta) {
  var teza;
  var visina;
  var diastolicni;
  var sistolicni;
  var ime;
  var datum;
  var priimek;
  if(stPacienta == 1) {
        ime= "Športni";
        priimek="Lojze";
        datum = "2012-06-12";
        teza = 80;
        visina = 185;
        diastolicni = 80;
        sistolicni = 120;
  }
  if(stPacienta == 3) {
        ime = "Debeli";
        priimek = "Jože";
      datum = "2013-06-12";
        teza = 140;
        visina = 195;
        diastolicni = 95;
        sistolicni = 160;
  }
  if(stPacienta == 2) {
      ime = "Suha";
      priimek = "Mici";
      datum = "2012-09-12";
        teza = 60;
        visina = 205;
        diastolicni = 75;
        sistolicni = 115;
  }
  datum += "T00:00:00.000Z";
  var ehr;
     var sessionId = getSessionId();
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        var odg = $.ajax({
            url: baseUrl + "/ehr",
            type: 'POST',
            success: function (data) {
                var ehrId = data.ehrId;
                ehr = ehrId;
                // build party data
                var partyData = {
                    firstNames: ime,
                    lastNames: priimek,
                    dateOfBirth: "1975-12-10T00:00:00.000Z",
                    partyAdditionalInfo: [
                        {
                            key: "ehrId",
                            value: ehrId
                        }
                    ]
                };
               $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(partyData),
                    success: function (party) {
                        if (party.action == 'CREATE') {
                            $("#generiraniTrije").append(ime + " " + priimek  +"  ||  " + ehrId + "<br>");
                            $("#opt"+stPacienta).val(ehrId);
                            $("#option"+stPacienta).val(ehrId);
                             dodajKlinicnePodatke(ehr,datum,sistolicni,diastolicni,visina,teza,1);
                        }
                    }
                }); 
            }
        });    
}

function generirajPodatke() {
    $("#generiraniTrije").text("");
    $("#generiraniTrije").html("<h3>Vzorčni primeri:</h3>");
    for(var i = 1; i <= 3; i++) {
        generirajTri(i);
    }
}

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
function createNewPatient() {
    var ime = $("#ime").val();
    var priimek = $("#priimek").val();
    var datum_rojstva = $("#datum_rojstva").val() + "T00:00:00.000Z";
    ustvariNovega(ime,priimek, datum_rojstva);
    $("#ime").val('');
    $("#priimek").val('');
    $("#datum_rojstva").val('');
}

function zamenjaj() {
    var value = $("#selectEhrId").val();
    $("#ehrIdVadba").val(value);
}

function make() {
    var value =$("#selectHim").val();
    var imePriimek = $("#selectHim").children(":selected").text();
    var ime = imePriimek.split(" ");
    console.log(imePriimek +"  "+ime);
    $("#ime").val(ime[0]);
    $("#priimek").val(ime[1]);
    $("#datum_rojstva").val(value);
}
function change() {
    var value = $("#selectEhr").val();
    $("#ehrId").val(value);
    var option = $("#selectEhr").children(":selected").attr("id");
    var sist;
    var dias;
    var visina;
    var teza;
    switch(option) {
        case "option1":
            teza=80;
            visina=185;
            sist= 120;
            dias= 80;
            break;
        case "option2":
            teza=60;
            visina=205;
            sist= 115;
            dias= 75;
            break;
        case "option3":
            teza=140;
            visina=195;
            sist= 160;
            dias= 95;
            break;
    }
    $("#weight").val(teza);
    $("#height").val(visina);
    $("#sistolic").val(sist);
    $("#diastolic").val(dias);
}

function ustvariNovega(ime, priimek, datum_rojstva) {
    if(ime.length == 0 || priimek.length == 0 || datum_rojstva.length == 0 || !ime || !priimek || !datum_rojstva) {
        $("#databaseResponse").text("Prosimo, da izpolnete vsa polja.")
    }else {
        var sessionId = getSessionId();
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        var odg = $.ajax({
            url: baseUrl + "/ehr",
            type: 'POST',
            success: function (data) {
                var ehrId = data.ehrId;
                // build party data
                var partyData = {
                    firstNames: ime,
                    lastNames: priimek,
                    dateOfBirth: datum_rojstva,
                    partyAdditionalInfo: [
                        {
                            key: "ehrId",
                            value: ehrId
                        }
                    ]
                };
               $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(partyData),
                    success: function (party) {
                        if (party.action == 'CREATE') {
                            $("#databaseResponse").html("Vaš EhrId: " + ehrId );
                        }
                    }
                }); console.log(ehrId);
            }
        });
    }
}

function analyseClinicalData() {
    var ehrId = $("#ehrId").val();
    var date = new Date();
    var dateJson = JSON.stringify();
    var diastolicni = $("#diastolic").val(); 
    var sistolicni = $("#sistolic").val(); 
    var teza = $("#weight").val();
    var visina = $("#height").val();
    dodajKlinicnePodatke(ehrId, dateJson,sistolicni,diastolicni,visina, teza,0);
    $("#ehrId").val('');
    $("#diastolic").val('');
    $("#sistolic").val(''); 
    $("#weight").val('');
    $("#height").val('');
}

function dodajKlinicnePodatke(ehrId, datum, sistolicni, diastolicni, visina, teza, objavi) {
    if(!ehrId || !sistolicni || !diastolicni || !visina || !teza || ehrId.length == 0 || sistolicni.length == 0  || diastolicni.length == 0 || visina.length == 0 || teza.length == 0) {
        $("#clinicalDataResponse").text("Prosimo vnesite zahtevane podatke.");
    } else {
        var sessionId = getSessionId();
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        var compositionData = {
            "ctx/time": datum,
            "ctx/language": "en",
            "ctx/territory": "CA",
            "vital_signs/blood_pressure/any_event/systolic": sistolicni,
            "vital_signs/blood_pressure/any_event/diastolic": diastolicni,
            "vital_signs/height_length/any_event/body_height_length": visina,
            "vital_signs/body_weight/any_event/body_weight": teza
        };
        var queryParams = {
            ehrId: ehrId,
            templateId: 'Vital Signs',
            format: 'FLAT',
            committer: 'Belinda Nurse'
        };
        console.log(JSON.stringify(compositionData));
        $.ajax({
            url: baseUrl + "/composition?" + $.param(queryParams),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(compositionData),
            success: function (res) {
                if(!objavi) {
                    $("#clinicalDataResponse").text("Uspešno dodani podatki.");
                }
            }
        });
    }
}


function findPhysicalActivity() {
    var ehrId = $("#ehrIdVadba").val();
    najdiFizicnoAktivnost(ehrId);
    $("ehrIdVadba").val('');
}

function najdiFizicnoAktivnost(ehrId) {
    if(!ehrId || ehrId.length == 0) {
        $("#beActiveResponse").val("Prosim vnesite ehrId.");
    } else {
        var sessionId = getSessionId();
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (data) {
                var party = data.party;
            }
        });
        $.ajax({
            url: baseUrl + "/view/" + ehrId + "/weight",
            type: 'GET',
            headers: {
                "Ehr-Session":sessionId
            },
            success: function (teza) {
                 $.ajax({
                     url: baseUrl + "/view/" + ehrId + "/height",
                    type: 'GET',
                    headers: {
                        "Ehr-Session":sessionId
                    },
                    success: function (visina) {
                         $.ajax({
                            url: baseUrl + "/view/" + ehrId + "/blood_pressure",
                            type: 'GET',
                            headers: {
                                "Ehr-Session":sessionId
                            },
                            success: function (krvniTlak) {
                                for (var i in krvniTlak) {
                                        if(i == 0) {
                                            var tab=krvniTlak[i].time.split("T");
                                            var datum = tab[0];
                                            $("#beActiveResponse").text("");
                                            $("#beActiveResponse").append("<h4>Vaši podatki na dan " + datum + ":</h4>");
                                            $("#beActiveResponse").append("<p>Telesna teža: <strong id='tezaIzracun'>" + teza[i].weight + " kg </strong><br> Telesna višina: <strong id = 'visinaIzracun'>" + visina[i].height +" cm</strong><br>Krvni tlak: <strong id='krvniTlakIzracun'>"+ krvniTlak[i].systolic+" / "+ krvniTlak[i].diastolic +" mm[hg]</strong></p>")
                                            initMap();
                                            $("#grafiNaslov").html("<br>Grafično primerjani pacientovi podatki z idealnim zdravstvenim stanjem<br>");
                                            resetCanvas();
                                            graphItm();
                                            graphSistolic();
                                            graphDiastolic();
                                            
                                    }
                                }
                            
                            }
                        }); 
                    
                    }
                }); 
            }
        }); 
    }
}
var type;
var problems;
var map;
//API key = AIzaSyCOfjETD_sgTff-FKe3DPLi-SzVPyygeM4
function initMap() {
    
    // Create a map object and specify the DOM element
    // for display.
    var x = document.getElementById('map');
    if (navigator.geolocation) {
        var coords = navigator.geolocation.getCurrentPosition(function(position) {
            var options = {
                  center: {lat:position.coords.latitude,lng:position.coords.longitude},
                  zoom: 12
                };
                
                var service;
                 var pyrmont = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                map = new google.maps.Map(document.getElementById('map'), options);
                var markerMe = new google.maps.Marker({
                      map: map,
                      position: {lat:position.coords.latitude,lng:position.coords.longitude}
                  }); 
                  var infowindowMe = new google.maps.InfoWindow();
                google.maps.event.addListener(markerMe, 'click', function() {
                    infowindowMe.setContent("Vaša lokacija");
                    infowindowMe.open(map, this);
                  });
                problems = izmeriSposobnosti();
                type=problems[0];
                console.log(type);
                problems.splice(0,1);
                izpisiTezave(problems);
                var request = {
                    location: pyrmont,
                    radius: '500000',
                    keyword: type
                    };
                  
                service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, callback);
        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      var marker = new google.maps.Marker({
          map: map,
          position:place.geometry.location
      }); 
      var infowindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker, 'click', function() {
        var mark = this;
        var coords = navigator.geolocation.getCurrentPosition(function(position) {
          var service;
          var pyrmont = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        service = new google.maps.places.PlacesService(map);
        var request = {
                    location: pyrmont,
                    radius: '500000',
                    keyword: type
                    };
                    
        service.nearbySearch(request, function(rez, status) {
            for (var i = 0; i < rez.length; i++) {
                if((JSON.stringify(rez[i].geometry.location)).localeCompare(JSON.stringify(mark.position)) == 0){
                    infowindow.setContent(rez[i].name);
                    infowindow.open(map, mark);
                    break;
                }
            }
        });
      });
     });
    }
  }
}

function izmeriSposobnosti() {
    var tezave=[];
    var krvniTlak = $("#krvniTlakIzracun").text().split("/");
    var sistolicni = parseInt(krvniTlak[0]);
    var diastolicni = parseInt(krvniTlak[1]);
    var visina =parseInt($("#visinaIzracun").text());
    var teza = parseInt($("#tezaIzracun").text());
    var indeksTelesneMase = teza/((visina/100) * (visina/100));
    //HIPERTENZIJA ||HIPOTENZIJA
    if(sistolicni > 140 || diastolicni > 90 || sistolicni < 105 || diastolicni < 60) {
        tezave.push("hospital");
        tezave.push("krvni tlak");
    }
    else {
        if(indeksTelesneMase > 30) {
            tezave.push("park");
            tezave.push("prekomerna telesna teža");
        } else if(indeksTelesneMase < 18.5) {
            tezave.push("'food'");
            tezave.push("podhranjenost");
        } else {
            tezave.push("gym");
        }
    }
    return tezave;
}

function izpisiTezave(tezave) {
    if(tezave.length == 0) {
        $("#sporociloZaUporabnika").html("<h4>Vaše zdravstveno stanje je brezhibno. Poiščite najbližjo telovadnico!</h4>");
    } else {
        console.log(tezave[0]);
        if(tezave[0].localeCompare("krvni tlak") == 0){
            $("#sporociloZaUporabnika").html("<h4>Vaš krvni pritisk je v kritičnem stanju. Poiščite najbližjo bolnišnico!</h4>");
        } else if(tezave[0].localeCompare("podhranjenost") == 0) {
            $("#sporociloZaUporabnika").html("<h4>Zelo ste podhranjeni, morda bi bilo bolje, če bi več jedli. Poiščite najbolj ustrezno restavracijo!</h4>");
        } else {
            $("#sporociloZaUporabnika").html("<h4>Imate prekomerno težo. Poiščite najbližji park, kjer se lahko sprehodite!</h4>");
        }
    }
}
function graphItm() { 
    var ctx = document.getElementById('myChartItm').getContext('2d');
    var itm = (parseInt($("#tezaIzracun").text()) / ((parseInt($("#visinaIzracun").text())/ 100) * (parseInt($("#visinaIzracun").text())/ 100)));
    console.log(itm);
    var chartItm = new Chart(ctx, {
        // The type of chart we want to create
        type: 'horizontalBar',
    
        // The data for our dataset
        data: {
            labels: ["Povprečni", "Pacientov"],
            datasets: [{
                backgroundColor: ["#3e95cd", "#c45850"],
                borderColor: 'rgb(255, 99, 132)',
                data: [21.75, itm],
            }]
        },
    
        // Configuration options go here
        options: {
            intersect: false,
             maintainAspectRatio: true,
            scales: {
                xAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 0
                  }    
                }]
              },
            responsive: false,
            legend: { display: false },
      title: {
        display: true,
        text: 'Indeks telesne mase'
      }   
        }
    });
   
}

function graphSistolic() {
    var krvniTlak = $("#krvniTlakIzracun").text().split("/");
    var sistolicni = parseInt(krvniTlak[0]);
    console.log(sistolicni);
    var ctx = document.getElementById('myChartSistolic').getContext('2d');
     var chartSistolicni = new Chart(ctx, {
        // The type of chart we want to create
        type: 'horizontalBar',
    
        // The data for our dataset
        data: {
            labels: ["Povprečni", "Pacientov"],
            datasets: [{
                backgroundColor: ["#3e95cd", "#c45850"],
                borderColor: 'rgb(255, 99, 132)',
                data: [120, sistolicni],
            }]
        },
    
        // Configuration options go here
        options: {
            intersect: false,
             maintainAspectRatio: true,
            scales: {
                xAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 0
                  }    
                }]
              },
            responsive: false,
            legend: { display: false },
      title: {
        display: true,
        text: 'Sistolični krvni tlak'
      }
      
        }
    });
}

function graphDiastolic() {
    var krvniTlak = $("#krvniTlakIzracun").text().split("/");
    var diastolicni = parseInt(krvniTlak[1]);
    console.log(diastolicni);
    var ctx = document.getElementById('myChartDiastolic').getContext('2d');
      var chartDiastolicni = new Chart(ctx, {
        // The type of chart we want to create
        
        type: 'horizontalBar',
    
        // The data for our dataset
        data: {
            labels: ["Povprečni", "Pacientov"],
            datasets: [{
                backgroundColor: ["#3e95cd", "#c45850"],
                borderColor: 'rgb(255, 99, 132)',
                data: [80, diastolicni],
            }]
        },
    
        // Configuration options go here
        options: {
            intersect: false,
            maintainAspectRatio: true,
            scales: {
                xAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 0
                  }    
                }]
              },
            responsive: false,
            legend: { display: false },
      title: {
        display: true,
        text: 'Diastolični krvni tlak'
      }
        }
    });
}

function resetCanvas() {
    $("#itmC").html("");
    $("#sisC").html("");
    $("#diasC").html("");
    $("#itmC").html('<canvas id="myChartItm" width="800" height="150"></canvas>');
    $("#sisC").html('<canvas id="myChartSistolic" width="800" height="150"></canvas>')
    $("#diasC").html('<canvas id="myChartDiastolic" width="800" height="150"></canvas>')
}
