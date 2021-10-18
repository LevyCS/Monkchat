import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBar from 'react-top-loading-bar'
 
import { ContainerConteudo } from './conteudo.styled'
import { ChatButton, ChatInput, ChatTextArea } from '../../components/outros/inputs'

import { useState, useRef } from 'react';
import Cookies from 'js-cookie'

import Api from '../../service/api';
import { useHistory } from 'react-router-dom';
const api = new Api();

function lerUsuarioLogado (navigation) {
    let logado = Cookies.get('usuario-logado')
    if (logado == null) {
        navigation.push('/')
        return null;
    }
    let usuarioLogado = JSON.parse(logado);
    return usuarioLogado; 
}

export default function Conteudo() {
    const navigation = useHistory();

    const usuarioLogado = lerUsuarioLogado(navigation) || {};

    const [chat, setChat] = useState([]);
    const [sala, setSala] = useState('');
    const [msg, setMsg] = useState('')
    const [idAlterado, setIdAlterado] = useState(0);
    const [usu, setUsu] = useState(usuarioLogado.nm_usuario);

    const loading = useRef(null);

    const validarResposta = (resp) => {
        if (!resp.erro)
            return true;
        toast.error(`${resp.erro}`);
        return false;
    }

    const carregarMensagens = async () => {
        loading.current.continuousStart();

        const mensagens = await api.listarMensagens(sala);
        if (validarResposta(mensagens))
            setChat(mensagens);

        loading.current.complete();
    }

    const enviarMensagem = async (event) => {
        if (event.type === "keypress" && (!event.ctrlKey || event.charCode !== 13))
            return;

        if (idAlterado > 0) {
            const resp = await api.alterarMensagem(idAlterado, msg)
            if(!validarResposta(resp))
                return;

            toast.dark('💕 Mensagem alterada com sucesso!')    
            setIdAlterado(0);
        } else {
            const resp = await api.inserirMensagem(sala, usu, msg);

            if (!validarResposta(resp)) 
                return;
            toast.dark('💕 Mensagem enviada com sucesso!');
        }

        setMsg('')
        await carregarMensagens();
    }

    const inserirSala = async () => {
        const resp = await api.inserirSala(sala);
        if (!validarResposta(resp)) 
            return;
        
        toast.dark('💕 Sala cadastrada!');
        await carregarMensagens();
    }

    const deletarMensagem = async (item) => {
        if (!(usu == item.tb_usuario.nm_usuario)) {
            toast.dark('Não é possivel excluir mensagens de outro usuário')
            return;
        }

        if(!(window.confirm('Tem certeza que deseja excluir a mensagem?'))) 
            return;

        const r = await api.deletarMensagem(item.id_chat);

        if (!validarResposta(r))
            return;

        toast.dark('💕 Mensagem apagada')
        await carregarMensagens();
    } 

    const alterarMensagem = async (item) => {
        setIdAlterado(item.id_chat);
        setMsg(item.ds_mensagem);
    }

    

    return (
        <ContainerConteudo>
            <ToastContainer />
            <LoadingBar color="red" ref={loading} />
            <div className="container-form">
                <div className="box-sala">
                    <div>
                        <div className="label">Sala</div>
                        <ChatInput value={sala} onChange={e => setSala(e.target.value)} />
                    </div>
                    <div>
                        <div className="label">Nick</div>
                        <ChatInput value={usu} readOnly={true} />
                    </div>
                    <div>
                        <ChatButton onClick={inserirSala}> Criar </ChatButton>
                        <ChatButton onClick={carregarMensagens} > Entrar </ChatButton>
                    </div>
                </div>
                <div className="box-mensagem">
                    <div className="label">Mensagem</div>
                    <ChatTextArea value={msg} onChange={e => setMsg(e.target.value)} onKeyPress={enviarMensagem}/>
                    <ChatButton onClick={enviarMensagem} className="btn-enviar"> Enviar </ChatButton>
                </div>
            </div>
            
            <div className="container-chat">
                
                <img onClick={carregarMensagens}
                    className="chat-atualizar"
                    src="/assets/images/atualizar.png" alt="" 
                />
                
                <div className="chat">
                    {chat.map(x =>
                        <div key={x.id_chat}>
                            <div className="chat-message">
                                <img className="chat-alterar" style={{ cursor: "pointer" }}
                                    onClick={() => alterarMensagem(x)}
                                    src="/assets/images/alterar.svg" alt=""
                                />
                                <img 
                                    onClick={() => {deletarMensagem(x)}}
                                    src="/assets/images/deletar.svg" style={{cursor: "pointer"}} alt="" 
                                        
                                />
                                <div>({new Date(x.dt_mensagem.replace('Z', '')).toLocaleTimeString()})</div>
                                <div><b>{x.tb_usuario.nm_usuario}</b> fala para <b>Todos</b>:</div>
                                <div> {x.ds_mensagem} </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ContainerConteudo>
    )
}