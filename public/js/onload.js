let theme = localStorage.getItem("Theme");

function CheckTheme() 
{
    if(theme == 'dark')
    {
        document.documentElement.setAttribute('dark','true');
        
    }
    else
    {
        document.documentElement.setAttribute('dark','false');
        
    }
}


function CheckThemeIcon()
{
    let Switch = document.querySelector(".nav-bar").querySelector("#theme");
    if(localStorage.getItem("Theme") == 'dark')
    {
        Switch.checked = false;
    }
    else
    {
        Switch.checked = true;
    }
}

async function checkMSGs()
{
    console.log("testing")
    setTimeout(()=>{
        let msgs = document.documentElement.querySelector(`.float_message`).querySelectorAll(`input[type="checkbox"]`);
        let hide =false;
        console.log(msgs)
        if(msgs.length == 0)
        {
            console.log("test")
            hide = true
        }
        else
        {
            for(let i = 0 ; i < msgs.length ;i++){
            
                if(msgs[i].checked)
                {
                    console.log(false)
                    hide = false;
                    break
                }
                hide = true
            }
        }
        if(hide == true)
        {
            document.documentElement.querySelector(".page").classList.remove("msg");
            // console.log("no check")
        }
        else
        {
            document.documentElement.querySelector(`.page`).classList.add("msg");
            // console.log("check")

        }
    },10)
    
}