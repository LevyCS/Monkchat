import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBar from 'react-top-loading-bar'

import { Container } from './styled'
import { ChatButton, ChatInput } from '../../components/outros/inputs'
import { useRef, useState } from 'react'
import Cookies from 'js-cookie'

import Api from '../../service/api'
import { useHistory } from 'react-router-dom';
const api = new Api();

export default function Login() {
    const navigation = useHistory();
    if(Cookies.get('usuario-logado') != null) {
        navigation.push('/chat')
    }

    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');


    const logar = async () => {
        loading.current.continuousStart();
        let r = await api.login(usuario, senha)
        if(r.erro) {
            loading.current.complete();
            toast.error(`${r.erro}`)
        } else {
            Cookies.set('usuario-logado', JSON.stringify(r));
            navigation.push('/chat')
        }
    }
    const loading = useRef(null);
    return (
        <Container>
            <ToastContainer />
            <LoadingBar color="red" ref={loading} />
            <div className="box">
                <div className="titulo">
                    <img src="/assets/images/logo-monkchat.png" alt="" />
                    <br />
                    MonkChat
                </div>
            </div>

            <div className="login">
                <div className="container-form">
                    <div className="form-row">
                        <div className="title">Faça seu Login</div>
                    </div>

                    <div className="form-row">
                        <div>
                            <div className="label">Login </div>
                            <ChatInput
                                value={usuario}
                                onChange={e => setUsuario(e.target.value)}
                                style={{ border: '1px solid gray', fontSize: '1.5em' }}
                            />
                        </div>
                        <div>
                            <div className="label">Senha </div>
                            <ChatInput
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                type="password"
                                style={{ border: '1px solid gray', fontSize: '1.5em' }}
                            />
                        </div>
                        <div>
                            <ChatButton
                                onClick={logar}
                                style={{ fontSize: '1.2em'}}> Login </ChatButton>
                        </div>
                    </div>
                </div>

            </div>
        </Container>
    )
}
