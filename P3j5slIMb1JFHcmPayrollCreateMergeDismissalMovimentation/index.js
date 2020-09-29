
/**
 * Nome da primitiva : createMergeDismissalMovimentation
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn06325988
 **/
 
const axios = require('axios');

exports.handler = async (event) => {
  let body = parseBody(event);
  
  let tokenSeniorX = event.headers['X-Senior-Token'];
  
 /* CUST DESAFIO CASSANDRI 
 let userSeniorX = event.headers['X-Senior-User'];

        
  userSeniorX = userSeniorX.split('@')[0];
  */
  const instance = axios.create({
    baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
    headers: {
      'Authorization': tokenSeniorX
    }
  });
  

  //Id do colaborador 
  let employeeId = body.employee.id;
  
  //busca informações do colaborador
  let response = await instance.get(`/hcm/payroll/entities/employee/${employeeId}`);
  
  let employee = response.data;

  if(employee.custom) {
    if(employee.custom.USU_CARCON === 'S') {
      //SOLUÇÂO DESAFIO 2
      let responseUser = await instance.get(`/platform/user/queries/getUser`);
      let user = responseUser.data;
      
      let responseDetail = await instance.post('platform/authorization/queries/getUserDetailRoles',  {"user":""+user.username+""});
        
      let groupsUser = responseDetail.data.roles;
        
      for (let groupUser of groupsUser){
        if (groupUser.name != "admin"){
          return sendRes(400,'Não é permitido programar desligamento para colaboradores com cargo de confiança!');
        }
      }
    }
  };
  
  /* solução cassandri
    //Tarefa de casa
  
  //Verifica se está no Grupo Admin
  let userRoles = await instance.post('/platform/authorization/queries/getUserDetailRoles', { user: userSeniorX });
  
  //percorre e filtra os perfis retornando apenas os que possuem nome como admin
  userRoles = userRoles.data.roles.filter(role => {
    return role.name === 'admin';
  }); 

  if(employee.custom) {
    if((employee.custom.USU_CARCOF === 'S') && (userRoles.length === 0)) {
      return sendRes(400,'Não é permitido programar desligamento para colaboradores com cargo de confiança!');
    }
  }
  */

  return sendRes(200, body);
};

const parseBody = (event) => {
    return typeof event.body === 'string' ?  JSON.parse(event.body) : event.body || {};
};

const sendRes = (status, body) => {
    var response = {
      statusCode: status,
      headers: {
        "Content-Type": "application/json"
      },
      body: typeof body === 'string' ? body : JSON.stringify(body) 
    };
    return response;
};