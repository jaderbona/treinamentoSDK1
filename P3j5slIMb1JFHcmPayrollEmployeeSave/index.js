
/**
 * Nome da primitiva : employeeSave
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

    /* Valida tamanho do apelido */
    if(body.sheetPersona.nickname) {
        if(body.sheetPersona.nickname.length > 10) {
            return sendRes(400,'O apelido deve ter no máximo 10 caracteres!');
        }
    } else {
        return sendRes(400,'O apelido deve ser informado!');
    }
    
    //-->DESAFIO 1 = Quando for deficiente o campo “preenche cota” deve obrigatoriamente ser informado com “Sim”.
    if(body.sheetPersona.isDisability == 'true'){
      if(body.sheetPersona.isOccupantQuota !== 'true'){
        return sendRes(400,'Quando for deficiente o campo "Preenche cota" deve ser informado com “Sim”!');
      }
    }

    /* Valida se a foto do colaborador está presente */
    if(!body.sheetPersona.attachment){
        return sendRes(400,'A foto do colaborador deve ser informada!');
    } 

    /* Não permite alteração de CPF */
    if(body.sheetInitial.employee) {
        let employee = await instance.get(`/hcm/payroll/entities/employee/${body.sheetInitial.employee.tableId}`);

        if(employee.data.person.cpf !== body.sheetDocument.cpfNumber){
            return sendRes(400,'Não é permitido alterar o CPF do Colaborador!'); 
        }
    }
    
    /*Valida Campo customizado em conjunto com campo nativo*/
    if((body.sheetContract.customFieldsEmployee) && (body.sheetComplement.issueDotCard)) {
        
        let customFields = body.sheetContract.customFieldsEmployee;
        let issueDotCard = body.sheetComplement.issueDotCard;
        
        //Percorre o array de campos customizados
        for(let customField of customFields) {
            if(customField.field === 'USU_CARCOF') {
                 if((customField.value === 'S') && (issueDotCard.key === 'Yes')) {
                     return sendRes(400,'Colaboradores com Cargo de confiança não devem emitir cartão Ponto!');
                }
            }
        }
    }

     /* Valida Range de Escalas para Tipo de Contrato empregado */ 
     if((body.sheetInitial.contractType.key === 'Employee') && (body.sheetWorkSchedule.workshift.tableId)){
        try {
            let workshiftResponse = await instance.get(`/hcm/payroll/entities/workshift/${body.sheetWorkSchedule.workshift.tableId}`);
            
            if((workshiftResponse.data.code >= 5) && (workshiftResponse.data.code <= 10) ) {
                return sendRes(400,'Range de escala não permitido para Empregados!');
            }

        } catch (error) {
            return sendRes(400,error.message);
        }
    }

    /*Valida se o PIS informando já está em uso por outro colaborador ativo*/ 
    if(body.sheetDocument.pisNumber) {
        let nisBody = {
            numberNis: body.sheetDocument.pisNumber,
            referenceDate: body.sheetDocument.hireDate,
            personId: (body.sheetInitial.person.tableId != 'new') ? body.sheetInitial.person.tableId : null
        };
        try {
            let alreadyThisNisResponse = await instance.post('/hcm/payroll/queries/personAlreadyThisNis',nisBody);
            if(alreadyThisNisResponse.data.result.ok) {
                return sendRes(400,alreadyThisNisResponse.data.result.message);    
            } 
        } catch(error) {
            return sendRes(400,error.message);
        }
    } 

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

/*
const axios = require("axios")

exports.handler = async event => {
  
  let body = parseBody(event);
  let tokenSeniorX = event.headers['X-Senior-Token'];
  
  //chamada utilizando axios
  const instance = axios.create({
    baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/',
    headers:{
      'Authorization' : tokenSeniorX
    }
  });
  
    //validação do apelido maior que 10 caracteres
    if (body.sheetPersona.nickname){//só entra nessa propriedade se ela existir
      if (body.sheetPersona.nickname.length > 10){
          return sendRes(400,"O apelido deve ser maior que 10 caracteres!");
      }
    } else{
       return sendRes(400,"O apelido deve ser informado");
    }
    
    //valida se a foto foi informada 
    if (!body.sheetPersona.attachment){
      return sendRes(400,"É obrigatório informar a foto");
    }
  
      /* Não permite alteração de CPF *//*
    if(body.sheetInitial.employee) {
        let employee = await instance.get(`/hcm/payroll/entities/employee/${body.sheetInitial.employee.tableId}`);

        if(employee.data.person.cpf !== body.sheetDocument.cpfNumber){
            return sendRes(400,'Não é permitido alterar o CPF do Colaborador!'); 
        }
    }
 /*
  //não permitir alterar o número de CPF do colaborador
 if (body.sheetInitial.employee){//validação se é um colaborador novo ou se ele já existe. 
   let employee = await instance.get(`/hcm/payroll/entities/employee/${body.sheetInitial.employee.tableId}`);
   
   if(employee.data.person.cpf !== body.sheetDocument.cpfNumber){
     return sendRes(400,'Não é permitido alterar o CPF do Colaborador!');
   }
 }*/
  
  //se todas as validações passarem
/*  return sendRes(200, JSON.parse(event.body));
};

const parseBody = (event) => {
  return typeof event.body ==='string' ? JSON.parse(event.body) : event.body || {};
};


const sendRes = (status, body) => {

 var response = {
    statusCode: status,
    headers: {
      "Content-Type": "application/json"
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)

  };
  
  console.log(body);
  return response;
};


//  let body = parseBody(event);
//  let tokenSeniox = event.headers['X-Senior-Token'];
  
  /*const api = axios.create({
    baseURL: 'https://platform-homologx.senior.com.br/t/senior.com.br/bridge/1.0/rest/',
    headers : {
      "Authorization" : tokenSeniox
    }
  });*/
  
 /* if (body.sheetPersona.nickname){
      if (body.sheetPersona.nickname.length > 10){
    return sendRes(400,"O apelido deve ser maior que 10 caracteres");
  }
  };*/

/*


//valida se a foto do colaborador está presente
if(!body.sheetPersona.attachement){
  return sendRes(400,'A foto do colaborador deve ser alterada')}

//não permitir alterar o número de CPF do colaborador
if(body.sheetInitial.employee){
  let employee = await instance.get('/hcm/payroll/entities/employee/${body.sheetInitial.employee.tableId}');
  
  if (employee.data.person.cpf !== body.sheetDocument.cpfNumber){
    return sendRes(400,'Não é permitido alterar o CPF do colaborador!');
  }
}
*/

