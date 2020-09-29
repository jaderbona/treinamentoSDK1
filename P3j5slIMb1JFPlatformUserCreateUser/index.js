
/**
 * Nome da primitiva : createUser
 * Nome do dominio : platform
 * Nome do serviço : user
 * Nome do tenant : trn06325988
 **/

exports.handler = async (event) => {
    return sendRes(200, JSON.parse(event.body));
};

const sendRes = (status, body) => {
  
  if (body.username.toUpperCase() == 'TESTE'){
      const response = {
        statusCode: 417,
        body: "Não é permitido criar um usuário com este nome."
      }
   return response  
  }else {
    body.fullName = body.fullName + " - Criado em " + todayformatted();
      var response = {
      statusCode: status,
      headers: {
        "Content-Type": "application/json"
      },
    body: JSON.stringify(body)
    };
  
    return response
  }
};

function todayformatted(){
  var today = new Date();
  
  var dd = today.getDate() - 1;
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10){
    dd = '0'+dd;
  }
  if (mm < 10){
    mm = '0' + mm;
  }
  return dd + '/' + mm + yyyy;
}