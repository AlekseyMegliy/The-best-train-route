// Начну с переформатирования exсel файла в удобный массив объектов. Этот кусок кода я честно позаимствовал из Stack Overflow
let ExcelToJSON = function() {

    this.parseExcel = function(file) {
      let reader = new FileReader();
  
      reader.onload = function(e) {
        let data = e.target.result;
        let workbook = XLSX.read(data, {
          type: 'binary'
        });
        
        workbook.SheetNames.forEach(function(sheetName) {
          // Вот и массив объектов  
          let XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        
          // Здесь я объявлю переменные, которыми восспользуюсь позже
          let cost_now = 0;
          let item_now = [];
          // station_visited - посещённые станции, начнём путь с первой в списке станции 
          let station_visited = [XL_row_object[0]["Start"]];
          let sometimes_cost = [];
          // now_start - станция, на которой, мы находимся сейчас, начнём конечно с первой 
          let now_start = XL_row_object[0]["Start"];
          let vertex = [];
          let vertexes = [];
  
            let tiiiime_to_looking_to_your_eyes = " ";
          
          // Создаю каталог всех станций. Использую алгоритм Дейкстры, нужно добавить "Стоимость" каждой вершина равную бесконечности, 
          // я добавлю 10000, это достаточно большая цифра в данных условиях
          for(let i=0; i<XL_row_object.length; i++){
            if(!vertex.includes(XL_row_object[i]["Start"])){
          vertex.push(XL_row_object[i]["Start"]); 
          vertexes.push({Station:XL_row_object[i]["Start"], Cost:Infinity });
          // Согласно алгоритму Дейксты, первая вершина (Станция) "Стоит" 0
          vertexes[0].Cost = 0;
        }
          }
          // Цикл, который будет работать пока длина массива посещённых станций не равна длине массива со всеми станциями
          // так как станции посещаются только один раз, длина обоих массивов будет равной, когда все станции будут посещены
        while(vertex.length != station_visited.length){
      
  
          //Цикл, который будет перебирать список поездов
          for(let i=0; i<XL_row_object.length; i++){
          
            // Добавим каждому поезду время, которое он тратит на проезд. Для этого переведём время в минуты 
            let split_time_start;
            let split_time_fin;
            split_time_start = XL_row_object[i]["Time_s"].split(":");
            split_time_fin = XL_row_object[i]["Time_f"].split(":");
            let time_s_min = +split_time_start[0] * 60 +  +split_time_start[1]; 
            let time_f_min = +split_time_fin[0] * 60 +  +split_time_fin[1]; 

            // Затем проверим, если время приезда больше, чем время отъезда, значит поезд приехал в этот же день, если нет, на следующий
            // это законно так как по условию "(гарантированно, что нет переездов дольше суток)". И запишем затраты на поездку к каждому поезду
            if(time_f_min > time_s_min){
              XL_row_object[i]["Full_time"] =   time_f_min - time_s_min;
            } else{
                XL_row_object[i]["Full_time"] = 24*60 + time_f_min - time_s_min;
            }
            
            

            // Проверка на то чтобы начальная станция рассматриваемого поезда совпадала с той, на которую прибыл предыдущий.
            // Чтобы у рассматриваемого поезда конечная точка маршрута не совпадала с уже посещёнными
            if( now_start == XL_row_object[i]["Start"] 
                && !station_visited.includes(XL_row_object[i]["Fin"]) 
                ){
             
              


              // Находим в катоалоге станций индекс конечной станции рассматриваемого поезда чтобы посмотреть его время
              // если станции маршрута данного поезда ещё не было посещены, то "Стоимость" конечной становится равной "Стоимости" 
              // прошедших станций + время проезда к этой станции. Либо её "Стоимости" до этого шага, в зависимости от того, что меньше 
              if(vertexes[vertex.indexOf(XL_row_object[i]["Fin"])]["Cost"] > cost_now + +XL_row_object[i]["Full_time"]){
                vertexes[vertex.indexOf(XL_row_object[i]["Fin"])]["Cost"] = cost_now + +XL_row_object[i]["Full_time"]
  
              }
  
             // "Стоимости" всех конечных станций подходящих поездов запишем в отдельный массив на тех же индексах, на каких они находятся в массиве объектов
              sometimes_cost[i] = vertexes[vertex.indexOf(XL_row_object[i]["Fin"])]["Cost"];
  
            }
         
            
             
          }
            // Нахождение наименьшей "Стоимости" из подходящих поездов
            function compareNumeric(a, b) {
              if (a > b) return 1;
              if (a == b) return 0;
              if (a < b) return -1;
            }
            
            function copySorted(arr) {
              return arr.slice().sort(compareNumeric);
            }
            
            
  
            // Смотрим индекс этой цены в массиве с "Стоимостями" подходящих поездов. И записываем позд и станцию, на которую он уезжает
            // Переменная по сути не нужна, но без неё кот вообще не читабельный 
            let cheapest = XL_row_object[
              sometimes_cost.indexOf(copySorted(sometimes_cost)[0])
              ];   
            
           
            item_now.push(cheapest["Numb"]);
  
            station_visited.push(cheapest["Fin"]);
  
            // Добавляем к текущей стоимости пути время поездки к следующей станции
            cost_now += +cheapest["Full_time"];
  
            // Делаем конечную станцию этого поезда начальной для следующего 
            now_start = cheapest["Fin"];
  
            // Обнуляем массив с "Стоимостями" 
            sometimes_cost = [];
        
      }
          // Перевод массива объектов в json чтобы он корректно отображался на странице. И само отображение на странице необходимых данных
          let json_object = JSON.stringify(XL_row_object);
          let json_object2 = JSON.stringify(vertexes);
          jQuery( '#xlx_json' ).val(  "Train numbers: " + item_now +  "\n" +  "Route: " + station_visited + "\n" + 
          "Time spent on the road: " + Math.floor(Math.floor(cost_now/(60*24))) + " Days " +  Math.floor((cost_now%(60*24))/60) + " Hours " + cost_now%60 + " Minutes " 
          );
       
        })
      };
  
      reader.readAsBinaryString(file);
    };
  };
  
  function handleFileSelect(evt) {
  
  let files = evt.target.files; 
  let xl2json = new ExcelToJSON();
  xl2json.parseExcel(files[0]);
  }
  
  