
debug = 0;

function handleClick() {
    if (document.getElementById("interval").checked) {
        document.getElementById("intervalo_tempo").style.display = 'block';
    } else {
        document.getElementById("intervalo_tempo").style.display = 'none';
    }
}


function isInteger(x) { return typeof x === "number" && isFinite(x) && Math.floor(x) === x; }
function isFloat(x) { return !!(x % 1); }

//https://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form

//Solicitação GET sincrona
function httpRequest(theUrl, autorization, metodo, carga) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(metodo, theUrl, false); // false for synchronous request
    xmlHttp.setRequestHeader('X-Authorization', autorization);

    //Caso tenhamos mais de 3 argumentos na função, sabemos que o 4 provavelmente é carga JSON
    if (arguments.length > 3) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(payload);
    } else {
        xmlHttp.send(null);
    }
    return xmlHttp.responseText;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function get_token_user() {
    var user = document.getElementById('input_user').value;
    var pass = document.getElementById('input_pass').value;
    var url = document.getElementById('input_token_url').value;
    var final_url_token_user = "http://" + url + "/api/auth/login";

    var request = {
        "username": user,
        "password": pass
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", final_url_token_user, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(request));

    xhr.onload = function () {
        console.log(this.responseText);
        data = JSON.parse(this.responseText);
        console.log(data);
        document.getElementById('token_api').value = "Bearer " + data.token;
    }
}

function enviar_dados() {
    var data = JSON.parse(document.getElementById('input_json_device').value);
    var token = document.getElementById('token_device').value;
    var url = document.getElementById('input_token_url').value;

    var final_url = "http://" + url + "/api/v1/" + token + "/telemetry";

    fetch(final_url, {
        method: "POST",
        body: JSON.stringify(data)
    }).then(res => {
        console.log("Request complete! response:", res);
    });
}

function Insert_CSV_Via_Token() {
    //Inserindo CSV pelo token
    var delimitador_csv = ";";
    var token_device_csv = document.getElementById('token_device_csv').value;
    var url = document.getElementById('input_token_url').value;

    var fileInput = document.getElementById("input_file_device_csv"),
        readFile = function () {
            reader = new FileReader();
            reader.onload = function () {
                document.getElementById('out').innerHTML = reader.result;
                result_input = reader.result
                wait = 0;
            };
            // start reading the file. When it is done, calls the onload event defined above.
            reader.readAsBinaryString(fileInput.files[0]);
        };
    fileInput.addEventListener('change', readFile);

    //Enviando o CSV como String e retornando como objeto
    var csv_obj = parse_csv(result_input);
    console.log(csv_obj);

    var qtd_keys = (csv_obj[1].length) - 1;             //Pega quantidade de elementos -1 (- o ts)
    for (let linha = 1; linha <= qtd_linhas; linha++) {         //Começa na segunda linha da tabela
        var payload_keys = "";
        var virgula = 0;
        for (let coluna = 1; coluna <= qtd_keys; coluna++) {
            if (virgula != 0) {
                payload_keys += ',';
            }
            //Verifica se contem um valor valido
            if (typeof csv_obj[linha][coluna] != 'undefined' && csv_obj[linha][coluna] != "") {

                //Caso esteja usando virgula como separador de decimais
                //Porem de for uma string vai dar problemas
                csv_obj[linha][coluna] = csv_obj[linha][coluna].replace(",", ".");

                //Iremos verificar se é interger ou float para, caso seja um dos dois não iremos colocar as aspas
                if (isInteger(csv_obj[linha][coluna]) || isFloat(csv_obj[linha][coluna])) {
                    payload_keys += '"' + csv_obj[0][coluna] + '":' + csv_obj[linha][coluna];
                    virgula = 1;
                    //Caso seja uma STRING
                } else {
                    payload_keys += '"' + csv_obj[0][coluna] + '":"' + csv_obj[linha][coluna] + '"';
                    virgula = 1;
                }
            } else {
                virgula = 0;
            }
        }

        //Cria o JSON contendo os dados para serem inseridos
        var payload = '{"ts":' + csv_obj[linha][0] + ', "values":{' + payload_keys + '}}';
        console.log("Payload: ", payload);

        var final_url = "http://" + url + "/api/v1/" + token_device_csv + "/telemetry";

        var xhr = new XMLHttpRequest();
        xhr.open("POST", final_url, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(payload);


        //Resposta da SOLICITAÇÃO
        xhr.onload = function () {
            console.log(this.responseText);
            data = JSON.parse(this.responseText);
            console.log(data);
        }
    }//Fim do for
    document.getElementById('loading').innerHTML = '';
}


function read_csv() {
    //Verifica se o campo Token contém algum valor
    var token_api = document.getElementById('token_api').value;
    var delimitador_csv = document.getElementById('input_delimitador').value;
    var delimitador_decimal = document.getElementById('input_delimit_dec').value;
    var entityId = document.getElementById('input_entity_id_csv').value;
    var entityType = document.getElementById('input_entity_type_csv').value;
    var url = document.getElementById('input_token_url').value;
    var scope = "scriptinsert";

    if (!token_api) {
        alert("Deve ser obtido um token de acesso a API, para isso basta preeencher um usuário e senha válidos e clicar no botão (Obter token)");
    } else {

        var fileInput = document.getElementById("input_file"),
            readFile = function () {
                reader = new FileReader();
                reader.onload = function () {
                    document.getElementById('out').innerHTML = reader.result;
                    result_input = reader.result
                    wait = 0;
                };
                // start reading the file. When it is done, calls the onload event defined above.
                reader.readAsBinaryString(fileInput.files[0]);
            };
        fileInput.addEventListener('change', readFile);

        //Enviando o CSV como String e retornando como objeto
        var csv_obj = parse_csv(result_input);
        console.log(csv_obj);

        var qtd_keys = (csv_obj[1].length) - 1;             //Pega quantidade de elementos -1 (- o ts)

        //Indicando a quantidade de linhas e colunas
        document.getElementById('info_csv').innerHTML = "Quantidade de linhas: " + qtd_linhas + "\nQuantidade de colunas: " + qtd_keys;
        document.getElementById('loading').innerHTML = '<progress>progress</progress>';

        for (let linha = 1; linha <= qtd_linhas; linha++) {         //Começa na segunda linha da tabela
            var payload_keys = "";
            var virgula = 0;
            for (let coluna = 1; coluna <= qtd_keys; coluna++) {
                if (virgula != 0) {
                    payload_keys += ',';
                }
                //Verifica se contem um valor valido
                if (typeof csv_obj[linha][coluna] != 'undefined' && csv_obj[linha][coluna] != "") {

                    //Caso esteja usando virgula como separador de decimais
                    //Porem de for uma string vai dar problemas
                    csv_obj[linha][coluna] = csv_obj[linha][coluna].replace(",", ".");

                    //Iremos verificar se é interger ou float para, caso seja um dos dois não iremos colocar as aspas
                    if (isInteger(csv_obj[linha][coluna]) || isFloat(csv_obj[linha][coluna])) {
                        payload_keys += '"' + csv_obj[0][coluna] + '":' + csv_obj[linha][coluna];
                        virgula = 1;
                        //Caso seja uma STRING
                    } else {
                        payload_keys += '"' + csv_obj[0][coluna] + '":"' + csv_obj[linha][coluna] + '"';
                        virgula = 1;
                    }
                } else {
                    virgula = 0;
                }
            }

            //Cria o JSON contendo os dados para serem inseridos
            var payload = '{"ts":' + csv_obj[linha][0] + ', "values":{' + payload_keys + '}}';
            console.log("Payload: ", payload);

            //REQUISIÇÂO POST
            final_url = "http://" + url + "/api/plugins/telemetry/" + entityType + "/" + entityId + "/timeseries/" + scope;
            autorization = "Bearer " + token_api;

            var xhr = new XMLHttpRequest();
            xhr.open("POST", final_url, false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-Authorization', autorization);
            xhr.send(payload);


            //Resposta da SOLICITAÇÃO
            xhr.onload = function () {
                console.log(this.responseText);
                data = JSON.parse(this.responseText);
                console.log(data);
            }
        }//Fim do for
        document.getElementById('loading').innerHTML = '';
    }
}

//Parse do csv de texto para objeto
function parse_csv(csv_bruto) {
    var csv_rows = csv_bruto.split("\n");
    //console.log("Quebra de linha: ",csv_rows);
    qtd_linhas = (csv_rows.length) - 1;

    delimitador_csv = ";";

    //Matriz do CSV
    result_csv = {};
    for (let i = 0; i < qtd_linhas; i++) {
        result_csv[i] = csv_rows[i].split(delimitador_csv);
    }
    //console.log("Resultado", result_csv);
    return result_csv;
}

function ativo_request() {
    //POST /api/plugins/telemetry/{entityType}/{entityId}/timeseries/{scope}
    var entityId = "6a141230-6317-11eb-acb4-5f4a39621b20";
    var url = "aurodemo.telix.com.br";
    var scope = "naosei"
    var entityType = "ASSET"

    final_url = "http://" + url + "/api/plugins/telemetry/" + entityType + "/" + entityId + "/timeseries/" + scope;
    autorization = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1AYXVyb3RlY25vbG9naWEuY29tIiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJ1c2VySWQiOiI2YThiMWJiMC00MTUxLTExZWItYmQyNi1jN2UzZDRmNTZhZjMiLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiYzliMWU0ODAtNDE1MC0xMWViLWJkMjYtYzdlM2Q0ZjU2YWYzIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNjEyMDIzNzAwLCJleHAiOjE2MTIwMzI3MDB9.gtR4SCA5BCgdaGhQ_FY6HBaBr05HSF349PAkviE1BL7Q3vpUvDlJIB2OulgZf9bFjYMencstM2jG8-eDI72nSA";


    carga = {
        viaREST: 123
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", final_url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', '*/*');
    xhr.setRequestHeader('X-Authorization', autorization);

    xhr.send(JSON.stringify(carga));

    xhr.onload = function () {
        console.log(this.responseText);
        data = JSON.parse(this.responseText);
        console.log(data);
    }
}

function searchDataAsset() {
    //Captura as séries de dados que estão no asset
    //GET /api/plugins/telemetry/{entityType}/{entityId}/keys/attributes
    var entityId = document.getElementById('asset_ID_delete').value;
    var autorization = document.getElementById('token_api').value;
    //var entityType = "ASSET";
    var entityType = document.getElementById('entity_type_delete_data').value;
    var url = document.getElementById('input_token_url').value;
    var final_url = "http://" + url + "/api/plugins/telemetry/" + entityType + "/" + entityId + "/keys/timeseries";

    result_GET_request = JSON.parse(httpRequest(final_url, autorization, "GET"));
    console.log(result_GET_request);

    var result_checkbox = '';

    //Exemplo de retorno
    //["ts","limit_max","limit_min","dado1","dado2","distancia","limit_atencao"]

    for (i = 0; i < result_GET_request.length; i++) {
        result_checkbox += '<li><input value="' + result_GET_request[i] + '" name="keys" class="keys" type="checkbox">' + result_GET_request[i] + '</li>';
    }

    //Acrescenta o checkbox
    document.getElementById("checkbox_series").innerHTML = result_checkbox;
}

function readCheckbox(name) {
    var checados = [];
    $.each($("input[name='" + name + "']:checked"), function () {
        checados.push($(this).val());
    });

    //Valores separados por virgula
    return checados.join(",");
}

function deleteDataAsset() {
    //Deleta TimeSérie de uma entidade
    //DELETE /api/plugins/telemetry/{entityType}/{entityId}/timeseries/delete{?keys,deleteAllDataForKeys,startTs,endTs,rewriteLatestIfDeleted}
    //deleteAllDataForKeys   --> Deleta todos os dados da timeseries
    //rewriteLatestIfDeleted --> false default

    var url = document.getElementById('input_token_url').value;
    var autorization = document.getElementById('token_api').value;
    var keys;
    var deleteAllDataForKeys = "false";
    //var entityType = "ASSET";
    var entityType = document.getElementById('entity_type_delete_data').value;
    var entityId = document.getElementById('asset_ID_delete').value;
    var startTs = new Date(document.getElementById('timeInitial').value).getTime();
    var endTs = new Date(document.getElementById('timeFinal').value).getTime();
    var rewriteLatestIfDeleted = "false";

    if (debug == 1) {
        console.log("Tempo inicial:", document.getElementById('timeInitial').value);
        console.log("TS inicial:", startTs);
        console.log("Tempo Final:", document.getElementById('timeFinal').value);
        console.log("Tempo Final:", endTs);
    }

    if (document.getElementById('interval').checked) {
        deleteAllDataForKeys = "false";
    } else {
        deleteAllDataForKeys = "true";
    }
    keys = readCheckbox("keys");
    console.log(keys);

    //http://191.252.177.70:25000/api/plugins/telemetry/ASSET/61390b60-778b-11eb-aa13-617dd802a9d3/timeseries/delete?keys=distancia,limit_min,limit_max&deleteAllDataForKeys=false&startTs=1613484000000&endTs=1613793600000&rewriteLatestIfDeleted=false
    let final_url = "http://" + url + "/api/plugins/telemetry/" + entityType + "/" + entityId + "/timeseries/delete?keys=" + keys + "&deleteAllDataForKeys=" + deleteAllDataForKeys + "&startTs=" + startTs + "&endTs="+ endTs +"&rewriteLatestIfDeleted=" + rewriteLatestIfDeleted;
    var result_DELETE_request = httpRequest(final_url, autorization, "DELETE");
    console.log(result_DELETE_request);
}