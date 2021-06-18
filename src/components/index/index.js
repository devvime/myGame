import Raven from '../../raven/index.js'
import loadingComponent from '../gameComponents/loading/index.js'

const component = () => {
    return (
        /*html*/
        `<section clas="index">
            <div id="loading-target"></div>
            <div class="container">
                <div class="row">
                    <div class="col-md-8 offset-md-2">
                        <div class="box">
                            <h2>Escolha seu<br/> Player</h2>
                            <div class="slick">
                                <div class="item">
                                    <img src="public/images/player-victor.gif" />
                                    <p>Victor</p>
                                    <button class="btn-select-player btn btn-info" data-player="player-victor">Escolher</button>
                                </div>
                                <div class="item">
                                    <img src="public/images/player-luccas.gif" />
                                    <p>Victor</p>
                                    <button class="btn-select-player btn btn-info" data-player="player-luccas">Escolher</button>
                                </div>
                                <div class="item">
                                    <img src="public/images/player-gustavo.gif" />
                                    <p>Victor</p>
                                    <button class="btn-select-player btn btn-info" data-player="player-gustavo">Escolher</button>
                                </div>
                            </div>
                        </div>
                    </div>                 
                </div>
            </div>
        </section>`
    )
}

function index() {

    Raven.loadStyle("game/main-menu/css/style.css")

    Raven.render(component)

    Raven.include("#loading-target", loadingComponent)

    $(document).ready(function() {

        $(".slick").slick({
            infinite: false,
            cssEase: 'linear'
        })

        $(".loading").fadeOut()

        $(".btn-select-player").on("click", function() {
            localStorage.setItem("player", $(this).data("player"))
            $(".loading").fadeIn()
            setTimeout(() => {
                $(".load").fadeOut()
                location.href = "/level-01"
            }, 1000)
        })

    })

}

export default index