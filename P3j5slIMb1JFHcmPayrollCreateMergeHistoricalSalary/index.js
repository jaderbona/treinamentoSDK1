
/**
 * Nome da primitiva : createMergeHistoricalSalary
 * Nome do dominio : hcm
 * Nome do serviço : payroll
 * Nome do tenant : trn06325988
 **/

const axios = require('axios');

exports.handler = async event => {

    let body = parseBody(event);
    let tokenSeniorX = event.headers['X-Senior-Token'];

    const instance = axios.create({
        baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
        headers: {
          'Authorization': tokenSeniorX
        }
    });
   
    
   /* 
   ** Validação do motivo de alteração histórico salarial. 
      let motivo = await instance.get(`/hcm/payroll/queries/autocomplete/${body.employee.id}`);
   if (motivo.fields == 0){
    return sendRes(400,'Não é permitido usar o motivo 1 - Admissão em alterações salariais!');
   }*/
   
   /*
   let historicoSalarial = await instance.get(`/hcm/payroll/entities/historicalSalary/${body.id}`);
   if (historicoSalarial.data.movimentationReason.code == 1){
    return sendRes(400,'Não é permitido usar o motivo 1 - Admissão em alterações salariais!');
   }*/
   
   
  
   /* 
   ** Validação do tipo de pessoa para alteração histórico salarial. 
   */
  let employee = await instance.get(`/hcm/payroll/entities/employee/${body.employee.id}`);
  if(employee.data.employeetype !== "EMPLOYEE"){
      return sendRes(400,'Só pode inserir histórico salarial para os Empregados!');
  }
 
 
   /* 
   ** Validação do data de alteração do histórico salarial. 
   */ 
  if (body.dateWhen < todayformatted()){
     return sendRes(400,'Só pode inserir histórico salarial com data maior que a data atual!');
  };
  

  /*Caso todas as validações passem*/
    return sendRes(200,body);
    
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



function todayformatted(){
  let today = new Date();
  
  let dd = today.getDate() - 1;
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();
  
  if (dd < 10){
    dd = '0'+dd;
  }
  if (mm < 10){
    mm = '0' + mm;
  }
  return yyyy + '-' + mm + '-' + dd;
}